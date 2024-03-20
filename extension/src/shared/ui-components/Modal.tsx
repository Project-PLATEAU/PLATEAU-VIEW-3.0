import { Box, IconButton, Modal, styled } from "@mui/material";
import React, { ReactNode } from "react";

import { CloseIcon } from "../../prototypes/ui-components";

type Props = {
  title?: string;
  children?: ReactNode;
  isVisible: boolean;
  titleIcon?: ReactNode;
  width?: number;
  onClose?: () => void;
};

const SharedModal: React.FC<Props> = ({
  title,
  isVisible,
  children,
  titleIcon,
  width,
  onClose,
}) => {
  return (
    <Modal open={isVisible} aria-labelledby="model">
      <StyledBox width={width}>
        <ModalHeader>
          <Title>
            {titleIcon}
            {title}
          </Title>
          <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </ModalHeader>
        {children}
      </StyledBox>
    </Modal>
  );
};

const StyledBox = styled(Box)<{ width?: number }>(({ theme, width = 560 }) => ({
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderRadius: theme.shape.borderRadius,
  boxSizing: "border-box",
  maxHeight: "calc(100vh - 50px)",
  overflowY: "auto",
  [theme.breakpoints.down("mobile")]: {
    width: `calc(100vw - ${theme.spacing(2)})`,
    overflowY: "scroll",
  },
}));

const ModalHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1, 1),
}));

const Title = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: theme.typography.h6.fontSize,
  fontWeight: theme.typography.body1.fontWeight,
  padding: theme.spacing(0, 1),
  gap: theme.spacing(1),
}));

export default SharedModal;
