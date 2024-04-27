import { Box, BoxProps } from "@mui/material";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const FormSection = ({ children, ...boxProps }: Props & BoxProps) => {
  return <Box {...boxProps}>{children}</Box>;
};

export default FormSection;
