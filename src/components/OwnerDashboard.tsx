import { useState } from "react";
import ReflectionsOverview from "./ReflectionsOverview";
import CreateReflection from "./CreateReflection";

/* eslint-disable @typescript-eslint/no-empty-object-type */
interface OwnerDashboardProps {}

const OwnerDashboard: React.FC<OwnerDashboardProps> = () => {
  const [pageState, setPageState] = useState<"overview" | "create">("overview");
  const [selectedReflectionId, setSelectedReflectionId] = useState<string | null>("");

  return (
    <>
      {pageState === "overview" && (
        <ReflectionsOverview
          isOwner={true}
          setPageState={() => setPageState("create")}
          editReflection={(reflectionId: string) => {
            setSelectedReflectionId(reflectionId);
            setPageState("create");
          }}
        />
      )}

      {pageState === "create" && (
        <CreateReflection
          selectedReflectionId={selectedReflectionId}
          goBack={() => {
            setSelectedReflectionId(null);
            setPageState("overview");
          }}
        />
      )}
    </>
  );
};

export default OwnerDashboard;
