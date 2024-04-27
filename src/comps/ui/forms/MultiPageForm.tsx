import { Box, BoxProps, Typography } from "@mui/material";
import {
  Dispatch,
  SetStateAction,
  ReactNode,
  useState,
  Children,
  isValidElement,
  cloneElement,
  ReactElement,
} from "react";

type Props<T> = {
  title: string;
  value: T;
  onFormChange: Dispatch<SetStateAction<T>>;
  onSubmit: (data: T) => void;
  submitText?: string;
  children?: ReactNode;
};

const MultiPageForm = <T extends unknown>({
  title,
  value,
  onFormChange,
  onSubmit,
  submitText,
  children,
  ...boxProps
}: Props<T> & BoxProps) => {
  const [page, setPage] = useState(0);

  const onNext = () => {
    if (page < Children.count(children) - 1) setPage(page + 1);
  };

  const onBack = () => {
    if (page > 0) setPage(page - 1);
  };

  const formPage = Children.map(children, (child, index) => {
    if (isValidElement(child) && index === page) {
      let first = index === 0;
      let last = index === Children.count(children) - 1;

      return cloneElement(child as ReactElement<any>, {
        value,
        onChange: onFormChange,
        first,
        last,
        onSubmit,
        onNext,
        onBack,
        submitText,
      });
    }
  });

  /* TODO: create a ui that tracks the current page you are on */
  return (
    <Box {...boxProps}>
      <Box sx={{ height: "10%", width: "100%", padding: "20px" }}>
        <Typography variant="h2" align="center">
          {title}
        </Typography>
      </Box>

      {formPage}
    </Box>
  );
};

export default MultiPageForm;
