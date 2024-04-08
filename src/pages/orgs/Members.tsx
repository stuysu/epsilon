import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";

const Members = () => {
  const organization: OrgContextType = useContext(OrgContext);

  return (
    <div>
      <h1>Members</h1>
    </div>
  );
};

export default Members;
