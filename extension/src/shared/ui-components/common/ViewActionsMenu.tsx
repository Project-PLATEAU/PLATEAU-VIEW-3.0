import { List, ListItemButton, Popper, PopperProps, styled } from "@mui/material";
import { FC } from "react";

type ViewActionsMenuProps = PopperProps & {
  actions?: {
    label: string;
    onClick?: () => void;
  }[];
};

export const ViewActionsMenu: FC<ViewActionsMenuProps> = ({ open, actions, ...props }) => {
  return (
    <ActionsPopper open={open} role={undefined} placement="bottom-end" {...props}>
      <ActionsList>
        {actions?.map((action, index) => (
          <ActionButton key={index} onClick={action.onClick}>
            {action.label}
          </ActionButton>
        ))}
      </ActionsList>
    </ActionsPopper>
  );
};

const ActionsPopper = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.modal,
}));

const ActionsList = styled(List)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  padding: theme.spacing(0.5, 0),
}));

const ActionButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(0.5, 2),
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.primary,
}));
