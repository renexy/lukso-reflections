import { useState } from "react";
import { addReflection } from "../services/firebase/firebase";
import ReflectionsOverview from "./ReflectionsOverview";
import CreateReflection from "./CreateReflection";

/* eslint-disable @typescript-eslint/no-empty-object-type */
interface OwnerDashboardProps {}

const OwnerDashboard: React.FC<OwnerDashboardProps> = () => {
  const [pageState, setPageState] = useState<"overview" | "create">("overview");

  return (
    <>
      {pageState === "overview" && (
        <ReflectionsOverview
          isOwner={true}
          setPageState={() => setPageState("create")}
        />
      )}

      {pageState === "create" && <CreateReflection goBack={() => setPageState("overview")}/>}
    </>
  );
};

export default OwnerDashboard;
