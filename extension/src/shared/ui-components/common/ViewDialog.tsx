import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import {
  styled,
  Dialog,
  DialogProps,
  dialogClasses,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";

import { ViewButton } from ".";

export type ViewDialogProps = DialogProps & {
  icon?: React.ReactNode;
  disableSubmit?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onClose?: () => void;
  onSubmit?: () => void;
};

export const ViewDialog: React.FC<ViewDialogProps> = ({
  icon,
  title,
  disableSubmit,
  primaryButtonText = "送信",
  secondaryButtonText = "キャンセル",
  children,
  onClose,
  onSubmit,
  ...props
}) => {
  return (
    <StyledDialog fullWidth {...props}>
      <DialogHeader>
        <Title>
          {icon}
          <StyledDialogTitle>{title}</StyledDialogTitle>
        </Title>
        <CloseButton onClick={onClose}>
          <ClearOutlinedIcon />
        </CloseButton>
      </DialogHeader>
      <StyledDialogContent>{children}</StyledDialogContent>
      <StyledDialogActions>
        <ViewButton onClick={onClose}>{secondaryButtonText}</ViewButton>
        <ViewButton color="primary" onClick={onSubmit} disabled={!!disableSubmit}>
          {primaryButtonText}
        </ViewButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

const StyledDialog = styled(Dialog)(() => ({
  [`.${dialogClasses.paper}`]: {
    maxWidth: "560px",
  },
}));

const DialogHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Title = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  fontWeight: "normal",
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1, 2),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2, 2),
}));
