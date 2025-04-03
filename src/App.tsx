import { CircularProgress } from "@mui/material";
import { useUpProvider } from "./services/providers/UPProvider";
import OwnerDashboard from "./components/OwnerDashboard";

function App() {
  const { accounts, contextAccounts } = useUpProvider();

  const isReady =
    accounts &&
    accounts.length > 0 &&
    contextAccounts &&
    contextAccounts.length > 0;
  const isOwner =
    isReady && contextAccounts[0].toLowerCase() === accounts[0].toLowerCase();

  if (!isReady)
    return (
      <div className="flex flex-col h-full w-full gap-[14px] justify-center items-center">
        <span>Login to continue</span>
        <CircularProgress color="secondary" />
      </div>
    );

  if (isOwner) return <OwnerDashboard />;
  else {
    return <span>Visit</span>
  }
}

export default App;
