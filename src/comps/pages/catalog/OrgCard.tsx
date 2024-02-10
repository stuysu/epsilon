import { Link } from "react-router-dom"
import { Box } from "@mui/material"

const OrgCard = ({ organization } : { organization : Partial<Organization> }) => {
    return (
        <Box sx={{ border: "5px solid black", width: "200px", height: "200px"}}>
            name: {organization.name}
            <br />
            mission: {organization.mission}
            <Link to={`/${organization.url}`}>Go to org</Link>
        </Box>
    )
}

export default OrgCard