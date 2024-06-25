import { ChangeEvent, useEffect } from "react";

import { Paper, Box, PaperProps, Button, Typography } from "@mui/material";
import { useSnackbar } from "notistack";

type FileType = "image/png" | "image/jpeg" | "image/webp" | "image/*";

type Requirements = {
    maxSize?: [number, "MB"];
    types?: FileType[];
};

type Props = {
    value?: File;
    field: string; // field must be in props so FormPage associates values correctly
    required?: boolean;
    requirements?: Requirements;
    preview?: boolean;
    onChange?: (updatedValue: File | undefined) => void;
    status?: {
        dirty: boolean;
        value: boolean;
    };
    changeStatus?: (field: string, newValue: boolean) => void;
};

const FormUpload = ({
    field,
    value,
    required,
    requirements,
    preview,
    onChange,
    status,
    changeStatus,
    ...paperProps
}: Props & PaperProps) => {
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const validate = (targetValue: any) => {
            if (!changeStatus) return;

            if (!required && targetValue === undefined) {
                changeStatus(field, true);
                return;
            }

            if (required) {
                changeStatus(field, targetValue !== undefined);
            }
        };

        validate(value);
    }, [required, requirements, value, changeStatus]);

    const hasFile = value ? true : false;

    const fileChanged = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        if (
            requirements?.maxSize && 
            event.target.files[0].size > requirements?.maxSize![0] * 1024 * 1024
        ) {
            return enqueueSnackbar(
                `File size exceeds ${requirements.maxSize[0]}MB limit.`,
                { variant: "error" },
            );
        }
        
        if (!onChange) return;

        onChange(event.target.files[0]);
    };

    return (
        <Paper
            {...paperProps}
            elevation={5}
            sx={{
                width: "100%",
                height: hasFile ? "220px" : "100px",
                borderRadius: "7px",
                padding: "10px",
                display: "flex",
                flexWrap: "wrap",
                position: "relative",
                ...paperProps.sx,
            }}
        >
            <Box
                sx={{
                    width: hasFile ? "100px" : "100%",
                    height: "100%",
                    position: "relative",
                    padding: "10px",
                }}
            >
                <Button
                    variant="contained"
                    component="label"
                    sx={{ width: "100%", height: hasFile ? "auto" : "100%" }}
                >
                    {hasFile ? "Change" : "Upload Image"}
                    <input
                        type="file"
                        accept={
                            requirements?.types
                                ? requirements.types.join(",")
                                : "*/*"
                        }
                        id="input-file-upload"
                        onChange={fileChanged}
                        value={value?.webkitRelativePath}
                        hidden
                    />
                </Button>
                <Typography>{value?.name}</Typography>

                {hasFile && (
                    <Button
                        onClick={() => onChange?.(undefined)}
                        variant="contained"
                        sx={{
                            position: "absolute",
                            bottom: "10px",
                            left: "10px",
                        }}
                    >
                        Remove
                    </Button>
                )}
            </Box>
            {preview && hasFile && (
                <Box
                    sx={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "100%",
                        position: "absolute",
                        right: "20px",
                    }}
                >
                    <img
                        alt={`${value?.name || "Empty File"}`}
                        src={value ? URL.createObjectURL(value) : ""}
                        width="200px"
                        height="200px"
                        style={{ borderRadius: "100%" }}
                    />
                </Box>
            )}
        </Paper>
    );
};

export default FormUpload;
