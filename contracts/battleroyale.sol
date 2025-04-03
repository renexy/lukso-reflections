// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LYXRoyale {
    struct Tournament {
        uint256 id;
        address creator;
        uint256 entryFee;
        uint256 prizePool;
        uint256 endTime;
        bool active;
        address winner;
        address[] participants;
    }

    mapping(uint256 => Tournament) public tournaments;
    mapping(address => uint256) public leaderboard; // Track total winnings
    mapping(address => uint256) public activeTournaments; // Track if a creator has an active tournament
    uint256 public contractReserve;
    address public owner;
    uint256 public tournamentCount;

    event ContractReserveUpdated(uint256 newReserve);
    event ReserveWithdrawn(address indexed owner, uint256 amount);

    event TournamentCreated(
        uint256 indexed tournamentId,
        address indexed creator,
        uint256 entryFee,
        uint256 endTime
    );
    event TournamentFinalized(
        uint256 indexed tournamentId,
        address indexed winner,
        uint256 prizeAmount
    );
    event ParticipantJoined(
        uint256 indexed tournamentId,
        uint256 indexed tournamentPrizePool,
        uint256 newEndTime
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function createTournament(uint256 _entryFee, uint256 _duration) external {
        require(
            activeTournaments[msg.sender] == 0,
            "You already have an active tournament"
        );

        uint256 tournamentId = ++tournamentCount;
        tournaments[tournamentId] = Tournament({
            id: tournamentId,
            creator: msg.sender,
            entryFee: _entryFee,
            prizePool: 0,
            endTime: block.timestamp + _duration,
            active: true,
            winner: address(0),
            participants: new address[](0)
        });

        activeTournaments[msg.sender] = tournamentId; // Mark the tournament as active for this creator

        emit TournamentCreated(
            tournamentId,
            msg.sender,
            _entryFee,
            block.timestamp + _duration
        );
    }

    function joinTournament(uint256 tournamentId) external payable {
        Tournament storage tournament = tournaments[tournamentId];
        require(block.timestamp < tournament.endTime, "Tournament has expired");
        require(tournament.active, "Tournament inactive");
        require(msg.value == tournament.entryFee, "Incorrect entry fee");

        tournament.participants.push(msg.sender);

        tournaments[tournamentId].prizePool += msg.value;

        uint256 randomSeed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    msg.sender,
                    block.prevrandao,
                    tournamentId,
                    tournament.participants.length
                )
            )
        );
        uint256 randomDuration = 60 + (randomSeed % 241);

        tournament.endTime += randomDuration;

        emit ParticipantJoined(
            tournamentId,
            tournaments[tournamentId].prizePool,
            tournament.endTime
        );
    }

    function finalizeTournament(uint256 tournamentId) external {
        Tournament storage tournament = tournaments[tournamentId];
        require(msg.sender == tournament.creator, "Only creator can finalize");
        require(block.timestamp >= tournament.endTime, "Tournament not ended");
        require(tournament.active, "Tournament already finalized");

        // If there are no participants, close the tournament without distributing funds
        if (tournament.participants.length == 0) {
            tournament.winner = address(0); // No winner
            tournament.active = false;
            activeTournaments[tournament.creator] = 0; // Allow creator to start a new tournament
            emit TournamentFinalized(tournamentId, address(0), 0); // Emit event with no prize
            return;
        }

        // Set the last participant as the winner
        address winner = tournament.participants[
            tournament.participants.length - 1
        ];

        // Distribute the prize pool: 1% to contract, 89% to winner, 10% to creator
        uint256 contractFee = (tournament.prizePool * 1) / 100; // 1% stays in the contract
        uint256 creatorFee = (tournament.prizePool * 10) / 100; // 10% to creator
        uint256 prize = tournament.prizePool - contractFee - creatorFee; // 89% to winner

        // Update contract reserve
        contractReserve += contractFee;
        emit ContractReserveUpdated(contractReserve);

        tournament.winner = winner;
        tournament.active = false;
        leaderboard[winner] += prize; // Update leaderboard
        activeTournaments[tournament.creator] = 0; // Allow creator to start a new tournament

        (bool successWinner, ) = payable(winner).call{value: prize}("");
        require(successWinner, "Failed to send prize to winner");

        (bool successCreator, ) = payable(tournament.creator).call{
            value: creatorFee
        }("");
        require(successCreator, "Failed to send fee to creator");

        emit TournamentFinalized(tournamentId, winner, prize);
    }

    function withdrawReserve() external onlyOwner {
        require(contractReserve > 0, "No funds to withdraw");

        uint256 amount = contractReserve;
        contractReserve = 0;

        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Failed to withdraw reserve");

        emit ContractReserveUpdated(contractReserve);
        emit ReserveWithdrawn(owner, amount);
    }

    function getLeaderboard(
        uint256 topN
    ) external view returns (address[] memory, uint256[] memory) {
        uint256 count = 0;
        address[] memory players = new address[](topN);
        uint256[] memory winnings = new uint256[](topN);

        // Temporary array to store all leaderboard data
        address[] memory allPlayers = new address[](tournamentCount);
        uint256[] memory allWinnings = new uint256[](tournamentCount);

        for (uint256 i = 1; i <= tournamentCount; i++) {
            Tournament storage tournament = tournaments[i];

            if (leaderboard[tournament.winner] > 0) {
                allPlayers[count] = tournament.winner;
                allWinnings[count] = leaderboard[tournament.winner];
                count++;
            }
        }

        // Sort by winnings (Bubble sort for simplicity, but you may optimize this)
        for (uint256 i = 0; i < count; i++) {
            for (uint256 j = i + 1; j < count; j++) {
                if (allWinnings[i] < allWinnings[j]) {
                    (allWinnings[i], allWinnings[j]) = (
                        allWinnings[j],
                        allWinnings[i]
                    );
                    (allPlayers[i], allPlayers[j]) = (
                        allPlayers[j],
                        allPlayers[i]
                    );
                }
            }
        }

        // Populate topN results
        for (uint256 i = 0; i < topN && i < count; i++) {
            players[i] = allPlayers[i];
            winnings[i] = allWinnings[i];
        }

        return (players, winnings);
    }

    receive() external payable {}
}
