import { useAtom } from "jotai";
import { useState } from "react";

import { showFeedbackModalAtom } from "../../../prototypes/view/states/app";
import { PLATEAU_API_URL } from "../../constants";
import FeedBackModal from "../../ui-components/FeedBackForm";
import FeedbackNotificationModal from "../../ui-components/FeedbackNotificationModal";

const dataURItoBlob = (dataURI: string) => {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

const FeedBack = () => {
  const [loading, setLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useAtom(showFeedbackModalAtom);
  const [notification, setNotification] = useState(false);

  const handleSubmit = async (params: {
    name: string;
    email: string;
    comment: string;
    attachMapReview: boolean;
  }) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", params.name);
    formData.append("email", params.email);
    formData.append("content", params.comment);
    const screenshot = window.reearth?.scene?.captureScreen(undefined, 0.01);
    if (params.attachMapReview && screenshot) {
      const file = dataURItoBlob(screenshot);
      formData.append("file", file);
    }

    await fetch(`${PLATEAU_API_URL}/opinion`, {
      method: "POST",
      body: formData,
    });

    setShowFeedbackModal(false);
    setNotification(true);
    setLoading(false);
  };

  return (
    <>
      <FeedBackModal
        onSubmit={handleSubmit}
        show={showFeedbackModal}
        loading={loading}
        setShowFeedbackModal={setShowFeedbackModal}
      />
      {notification && (
        <FeedbackNotificationModal show={notification} handleCloseModal={setNotification} />
      )}
    </>
  );
};

export default FeedBack;
