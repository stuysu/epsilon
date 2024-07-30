import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            p={3}
        >
            <Typography variant="h1" gutterBottom>
                404 - Page Not Found
            </Typography>
            <Typography variant="body1" gutterBottom>
                Although Epsilon encompasses many services for Stuyvesant, it unfortunately does not have everything.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleGoHome}
                sx={{ mt: 3, padding: '10px 20px', fontSize: '16px' }}
            >
                Go to Home
            </Button>
        </Box>
    );
};

export default NotFound;
