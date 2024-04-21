import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import { Box, useMediaQuery } from "@mui/material";
import { Masonry } from "@mui/lab";

import OrgCard from "../comps/pages/catalog/OrgCard";
import { useSnackbar } from "notistack";

const Catalog = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orgs, setOrgs] = useState<Partial<Organization>[]>([]);

  const isTwo = useMediaQuery("(max-width: 1000px)");
  const isOne = useMediaQuery("(max-width: 500px)");
  
  let columns = 3;
  if (isTwo) columns = 2;
  if (isOne) columns = 1;

  useEffect(() => {
    const getOrgs = async () => {
      const { data, error } = await supabase.from("organizations").select(`
                        id,
                        name,
                        url,
                        picture,
                        mission,
                        state
                    `);

      if (error) {
        enqueueSnackbar("Error fetching organizations. Contact it@stuysu.org for support.", { variant: "error" });
        return;
      }

      setOrgs(data);
    };
    getOrgs();
  }, []);

  return (
    <Box>
      <h1>Catalog!</h1>
      <Box sx= {{ width: (isOne || isTwo) ? '100%' : '70%', padding: '20px' }}>
        <Masonry columns={columns} spacing={2}>
          {orgs.map(org => {
            if (org.state === "PENDING" || org.state === "LOCKED") return <></>;
            return (
              <OrgCard organization={org} key={org.id} />
            );
          })}
        </Masonry>
      </Box>
    </Box>
  );
};

export default Catalog;
