import { ChangeEvent } from "react";

import { Box, BoxProps, Button, Typography } from "@mui/material";

type FileType = "image/png" | "image/jpeg" | "image/webp" | "image/*"

type Requirements = {
    maxSize?: [number, "MB"],
    types?: FileType[]
}

type Props = {
    value?: File,
    field: string,
    required?: boolean,
    requirements?: Requirements,
    preview?: boolean,
    onChange?: (field: string, updatedValue: File | undefined) => void
}

const FormUpload = (
    { 
        value, 
        field,
        required,
        requirements, 
        preview,
        onChange,
        ...boxProps 
    } : 
    Props & BoxProps
) => {
    const hasFile = value ? true : false;

    const fileChanged = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        if (!onChange) return;

        onChange(field, event.target.files[0]);
    }

    return (
        <Box 
            {...boxProps}
            sx={{
                width: '100%',
                height: hasFile ? '220px' : '100px',
                borderRadius: '7px',
                padding: '10px',
                display: 'flex',
                flexWrap: 'wrap',
                position: 'relative',
                ...boxProps.sx
            }}
        >
            
            <Box sx={{ width: hasFile ? '100px' : '100%', height: '100%', position: 'relative', padding: '10px' }}>
                <Button variant='contained' component='label' sx={{ width: '100%', height: hasFile ? 'auto' : '100%'}}>
                    {hasFile ? 'Change' : 'Upload Image'}
                    <input
                        type="file"
                        accept={requirements?.types ? requirements.types.join(",") : "*/*"}
                        id='input-file-upload'
                        onChange={fileChanged}
                        value={value?.webkitRelativePath}
                        hidden
                    />
                </Button>
                <Typography>{value?.name}</Typography>

                {hasFile && (
                    <Button
                        onClick={() => onChange?.(field, undefined)} 
                        variant='contained'
                        sx={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '10px'
                        }}
                    >
                        Remove
                    </Button>
                )}
                
            </Box>
            { 
                (preview && hasFile) && (
                    <Box sx={{ 
                        width: '200px', 
                        height: '200px', 
                        borderRadius: '100%',
                        position: 'absolute',
                        right: '20px'
                    }}>
                        <img 
                            src={value ? URL.createObjectURL(value) : ""} width="200px" height="200px"
                            style={{ borderRadius: '100%' }} 
                        />
                    </Box>
                )
            }
        </Box>
    )
}

export default FormUpload;