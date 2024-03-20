import {
  ListItem,
  listItemSecondaryActionClasses,
  ListItemText,
  listItemTextClasses,
  styled,
  svgIconClasses,
  type ListItemProps,
  type SvgIconProps,
} from "@mui/material";
import { forwardRef, type ComponentType, type ReactNode } from "react";

const StyledListItem = styled(ListItem)(({ theme }) => ({
  alignItems: "center",
  minHeight: theme.spacing(5),
  paddingRight: theme.spacing(0.5),
  [`& .${listItemSecondaryActionClasses.root}`]: {
    position: "relative",
    transform: "none",
    flexGrow: 0,
    marginLeft: theme.spacing(1),
  },
})) as unknown as typeof ListItem; // For generics

export const EntityTitleIcon = styled("div")(({ theme }) => ({
  marginRight: theme.spacing(1.5),
  [`& .${svgIconClasses.root}`]: {
    display: "block",
  },
}));

export const EntityTitleText = styled(ListItemText, {
  shouldForwardProp: prop => prop !== "allowWrap",
})<{ allowWrap?: boolean }>(({ allowWrap }) => ({
  flexGrow: 1,
  marginTop: 4,
  marginBottom: 4,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  [`& .${listItemTextClasses.primary}`]: {
    display: "inline",
  },
  [`& .${listItemTextClasses.secondary}`]: {
    display: "inline",
  },
  [`& .${listItemTextClasses.primary} + .${listItemTextClasses.secondary}`]: {
    marginLeft: "1em",
  },
  ...(allowWrap && {
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "unset",
  }),
}));

export interface EntityTitleProps extends Omit<ListItemProps<"div">, "title"> {
  title?:
    | ReactNode
    | {
        primary: ReactNode;
        secondary?: ReactNode;
      };
  iconComponent?: ComponentType<SvgIconProps>;
  icon?: ReactNode;
  allowWrap?: boolean;
}

export const EntityTitle = forwardRef<HTMLDivElement, EntityTitleProps>(
  ({ title, iconComponent, icon, children, allowWrap, ...props }, ref) => {
    const Icon = iconComponent;
    return (
      <StyledListItem ref={ref} {...props} component="div">
        {(icon != null || Icon != null) && (
          <EntityTitleIcon>
            {icon != null ? icon : Icon != null ? <Icon fontSize="medium" /> : null}
          </EntityTitleIcon>
        )}
        <EntityTitleText
          primary={
            typeof title === "object" && title != null && "primary" in title
              ? title?.primary
              : title
          }
          secondary={
            typeof title === "object" && title != null && "secondary" in title
              ? title?.secondary
              : undefined
          }
          primaryTypographyProps={{
            variant: "body1",
          }}
          secondaryTypographyProps={{
            variant: "body2",
          }}
          allowWrap={allowWrap}
        />
        {children}
      </StyledListItem>
    );
  },
);
