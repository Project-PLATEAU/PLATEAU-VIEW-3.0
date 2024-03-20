import InsertCommentOutlinedIcon from "@mui/icons-material/InsertCommentOutlined";
import { Typography, styled } from "@mui/material";
import { FC, useCallback } from "react";

import FeedbackIcon from "../view/assets/undraw_subscriber.svg"; // Replace with the actual path to your SVG file

import SharedModal from "./Modal";

export type Props = {
  show: boolean;
  handleCloseModal: (show: boolean) => void;
};
const FeedbackNotificationModal: FC<Props> = ({ show, handleCloseModal }) => {
  const onClose = useCallback(() => {
    handleCloseModal(false);
  }, [handleCloseModal]);

  return (
    <SharedModal
      titleIcon={<InsertCommentOutlinedIcon sx={{ mr: 1 }} />}
      isVisible={show}
      onClose={onClose}
      title="フィードバック">
      <Wrapper>
        <StyledImage>
          <img src={FeedbackIcon} alt="Feedback Icon" />
        </StyledImage>
        <Typography id="modal-modal-description" sx={{ mt: 2, mb: 2 }}>
          あなたのフィードバックは送信されました。ありがとうございました。
        </Typography>
      </Wrapper>
    </SharedModal>
  );
};

const Wrapper = styled("div")(() => ({
  textAlign: "center",
  borderTop: "1px solid #0000001f",
}));

const StyledImage = styled("div")(({ theme }) => ({
  width: "auto",
  justifyContent: "center",
  marginTop: theme.spacing(1.8),
  alignItems: "center",
}));
export default FeedbackNotificationModal;
