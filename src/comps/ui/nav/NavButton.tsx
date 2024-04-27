import { Box, SxProps } from "@mui/material";

type Props = {
    display: string,
    onClick: () => void
}

const navButtonStyle : SxProps = {
    color: 'inherit',
    textDecoration: 'none',
    width: '100%',
    height: '60px',
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: "20px",
    cursor: 'pointer',
    transition: 'filter 0.2s ease-out',
    backgroundColor: 'inherit',
    "&:hover": { filter: 'brightness(125%)', transition: 'filter 0.2s ease-out' }
}

const NavButton = (
    { 
        display,
        onClick
    } : Props
) => {
    return (
        <Box onClick={onClick} sx={navButtonStyle}>
            {display}
        </Box>
    )
}

export default NavButton;