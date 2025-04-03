/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { getReflectionsByWallet } from "../services/firebase/firebase";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TwitterIcon from "@mui/icons-material/Twitter";
import EditIcon from "@mui/icons-material/Edit";
import { useUpProvider } from "../services/providers/UPProvider";

/* eslint-disable @typescript-eslint/no-empty-object-type */
interface ReflectionsOverviewProps {
  setPageState: (state: "overview" | "create") => void;
  isOwner: boolean;
}

const ReflectionsOverview: React.FC<ReflectionsOverviewProps> = ({
  setPageState,
  isOwner,
}) => {
  const { contextAccounts } = useUpProvider();
  const [reflectionsLoading, setReflectionsLoading] = useState<boolean>(true);
  const [reflections, setReflections] = useState<any>([]);

  useEffect(() => {
    getReflections();
  }, []);

  const getReflections = async () => {
    const result = await getReflectionsByWallet(contextAccounts[0]);
    setReflections(result);
    setReflectionsLoading(false);
  };

  const headerText = (text: string) => {
    if (text && text.length > 35) {
      return text.substring(0, 35) + "...";
    }
    return text;
  };

  const bodyText = (text: string) => {
    if (text && text.length > 35) {
      return text.substring(34, text.length);
    }
    return text;
  };

  const tweet = (text: string) => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(tweetUrl, "_blank");
  };

  if (reflectionsLoading)
    return (
      <div
        className="bg-white bg-opacity-95 shadow-lg p-4 rounded-lg max-h-[540px] min-h-[250px] 
    w-[500px] relative animate-fadeInSlideUp justify-center items-center flex flex-col justify-center gap-[20px]"
      >
        <span>Loading reflections...</span>
        <CircularProgress color="secondary" />
      </div>
    );

  return (
    <>
      <div
        className="bg-white bg-opacity-95 shadow-lg p-4 rounded-lg min-h-[250px] gap-[12px] 
  w-[500px] relative animate-fadeInSlideUp flex flex-col justify-between"
        style={{ maxHeight: "600px", overflowY: "auto" }}
      >
        {reflections.length < 1 && <span>No reflections</span>}
        {reflections.length > 0 && (
          <div className="flex flex-col w-full gap-[12px] justify-center items-center">
            {reflections.map((reflection: any, index: number) => {
              return (
                <Accordion key={index}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3-content"
                    id="panel3-header"
                    sx={{
                      "& .MuiAccordionSummary-content": {
                        justifyContent: "space-between",
                      },
                    }}
                  >
                    <Typography component="span">
                      {headerText(reflection.text)}
                    </Typography>
                    <div className="flex gap-[4px]">
                      <TwitterIcon
                        color="secondary"
                        onClick={() => tweet(reflection.text)}
                      />
                      <EditIcon color="secondary" />
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography component="span">
                      {bodyText(reflection.text)}
                      skyscrapers and neon lights. lone musician played his
                      violin. The melody weaved through the streets, touching
                      hearts of strangers passing by. For a moment, the world
                      slowed, and in that fleeting harmony, they all felt
                      connected.
                    </Typography>
                  </AccordionDetails>
                  <AccordionActions>
                    <Typography component="span">
                      Donations received: {reflection.lyxReceived} LYX
                    </Typography>
                    <Button color="secondary" size="small">
                      Donate
                    </Button>
                  </AccordionActions>
                </Accordion>
              );
            })}
          </div>
        )}

        <div className="flex w-full justify-center items-center gap-[8px]">
          {isOwner && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setPageState("create")}
            >
              Create one! 💡
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default ReflectionsOverview;
