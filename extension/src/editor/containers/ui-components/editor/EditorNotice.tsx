import { Alert, Snackbar, styled } from "@mui/material";
import { forwardRef, useImperativeHandle, useState } from "react";

export type EditorNoticeRef = {
  show: (notice: {
    severity: "success" | "info" | "warning" | "error" | undefined;
    message: string;
  }) => void;
};

const StyledSnackbar = styled(Snackbar)(() => ({
  position: "absolute",
}));

export const EditorNotice = forwardRef((_, ref) => {
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<"success" | "info" | "warning" | "error" | undefined>();
  const [message, setMessage] = useState<string>();

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    show: (notice: {
      severity: "success" | "info" | "warning" | "error" | undefined;
      message: string;
    }) => {
      setSeverity(notice.severity);
      setMessage(notice.message);
      setOpen(true);
    },
  }));

  return (
    <StyledSnackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}>
      <Alert severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </StyledSnackbar>
  );
});
