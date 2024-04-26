import { Box, Typography } from "@mui/material"

type Props = {
    role: Membership["role"],
    email: User["email"],
    picture: User["picture"],
    first_name: User["first_name"],
    last_name: User["last_name"],
    is_faculty: User["is_faculty"]
}

const OrgMember = (
    { 
        role,
        email,
        picture,
        first_name,
        last_name,
        is_faculty
    } : Props
) => {
    return (
        <Box sx={{ width: '100%', height: '75px', display: 'flex', flexWrap: 'nowrap'}}>
            <Box sx={{ width: '75px', height: '75px', padding: '15px' }}>
                <img 
                    width='100%'
                    height='100%'
                    src={picture}
                    style={{ borderRadius: '100%'}}
                    alt={`Member ${first_name} ${last_name}`}
                />
            </Box>
            <Box sx={{ height: '75px', padding: '5px'}}>
                <Typography>{first_name} {last_name}</Typography>
                <Typography>{role}{is_faculty && " - Faculty"}</Typography>
                <Typography>{email}</Typography>
            </Box>
        </Box>
    )
}

export default OrgMember;