import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { styled, ButtonGroup, ButtonGroupProps, Button, buttonGroupClasses } from "@mui/material";

type ComponentGroupSplitButtonProps = ButtonGroupProps & {
  name: string;
  active?: boolean;
  buttonRef?: React.RefObject<HTMLDivElement>;
  onMainButtonClick?: () => void;
  onSideButtonClick?: () => void;
};

export const ComponentGroupSplitButton: React.FC<ComponentGroupSplitButtonProps> = ({
  name,
  active,
  buttonRef,
  onMainButtonClick,
  onSideButtonClick,
  ...props
}) => {
  return (
    <StyledButtonGroup active={active ? 1 : 0} ref={buttonRef} {...props}>
      <StyledButton variant="contained" onClick={onMainButtonClick}>
        {name}
      </StyledButton>
      <StyledSplitButton variant="contained" onClick={onSideButtonClick}>
        <MoreVertOutlinedIcon fontSize="small" />
      </StyledSplitButton>
    </StyledButtonGroup>
  );
};

const StyledButtonGroup = styled(ButtonGroup)<{ active?: number }>(({ theme, active }) => ({
  position: "relative",
  [`&.${buttonGroupClasses.root}`]: {
    border: active
      ? `2px solid ${theme.palette.primary.main}`
      : `2px solid ${theme.palette.background.paper}`,
    overflow: "hidden",
  },
  [`.${buttonGroupClasses.grouped}`]: {
    minWidth: "28px",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  height: "28px",
  padding: theme.spacing(0, 1),
  fontSize: theme.typography.body2.fontSize,
  [`&.${buttonGroupClasses.grouped}`]: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "none",
    borderRadius: "0",
  },
}));

const StyledSplitButton = styled(StyledButton)(({ theme }) => ({
  padding: theme.spacing(0),
  [`&.${buttonGroupClasses.grouped}`]: {
    color: theme.palette.text.secondary,
  },
}));
