import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import { Box, useMediaQuery, Typography, TextField } from "@mui/material";
import { Masonry } from "@mui/lab";

import OrgCard from "../comps/pages/catalog/OrgCard";
import { useSnackbar } from "notistack";

import InfiniteScroll from "react-infinite-scroll-component";

import Loading from "../comps/ui/Loading";

const Catalog = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orgs, setOrgs] = useState<Partial<Organization>[]>([]);

  const [seed, setSeed] = useState(Math.random());
  const [offset, setOffset] = useState(0);
  const [more, setMore] = useState(true);

  const isTwo = useMediaQuery("(max-width: 1000px)");
  const isOne = useMediaQuery("(max-width: 500px)");
  
  let columns = 3;
  if (isTwo) columns = 2;
  if (isOne) columns = 1;

  const getOrgs = async () => {
    if (!more) return;

    const { data, error } = await supabase
      .rpc(
        'get_random_organizations',
        { seed, query_offset: offset, query_limit: 10 }
      );
                    

    if (error || !data) {
      enqueueSnackbar("Error fetching organizations. Contact it@stuysu.org for support.", { variant: "error" });
      return;
    }

    if (!data.length) {
      setMore(false);
    }

    setOffset(offset + data.length);
    setOrgs([...orgs, ...data]);
  };

  useEffect(() => {
    getOrgs();
  }, [seed]);

  return (
    <Box sx={{ display: 'flex', position: 'relative', flexWrap: 'wrap'}}>
      <Box 
        sx={{ 
          width: (isOne || isTwo) ? '100%' : '25%', 
          height: (isOne || isTwo) ? ' ' : '100vh',
          padding: '20px',
          position: (isOne || isTwo) ? 'relative' : 'sticky',
          top: 0,
          paddingTop: '40px'
        }} 
      >
        <Box sx={{ width: '100%', height: '50px', display: 'flex', justifyContent: 'center'}}>
          <TextField label='Search' sx={{ width: '100%' }} />
        </Box>
        <Box sx={{ width: '100%', padding: '20px', marginTop: '15px' }}>
          <Typography>Tags</Typography>
        </Box>
        <Box sx={{ width: '100%', padding: '20px', marginTop: '15px' }}>
          <Typography>Commitment Level</Typography>
        </Box>
        <Box sx={{ width: '100%', padding: '20px', marginTop: '15px' }}>
          <Typography>Meeting Days</Typography>
        </Box>
      </Box>
      <Box sx= {{ width: (isOne || isTwo) ? '100%' : '75%', padding: '20px', position: 'relative' }}>
        <Typography variant='h3'>Catalog</Typography>
        <InfiniteScroll
          dataLength={orgs.length}
          next={getOrgs}
          hasMore={more}
          loader={<Loading />}
          endMessage={
            <Box>
              <Typography align='center' variant='h3'>Thats it! You viewed every club! Stop procrastinating.</Typography>
            </Box>
          }
          style={{ overflow: 'hidden'}}
        >
          <Masonry columns={columns} spacing={2}>
            {orgs.map(org => {
              if (org.state === "PENDING" || org.state === "LOCKED") return <></>;
              return (
                <OrgCard organization={org} key={org.id} />
              );
            })}
          </Masonry>
        </InfiniteScroll>
      </Box>
    </Box>
  );
};

export default Catalog;
