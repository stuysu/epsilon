import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";

const Overview = () => {
  const organization: OrgContextType = useContext(OrgContext);

  return (
    <div>
      {organization.id === -1 ? (
        <div>
          <h1>Org doesn't exist</h1>
        </div>
      ) : (
        <div>
          <h1>{organization.name} Overview</h1>
          <pre>{JSON.stringify(organization, undefined, 4)}</pre>
        </div>
      )}
    </div>
  );
};

export default Overview;
