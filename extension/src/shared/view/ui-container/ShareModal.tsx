import { useSetAtom } from "jotai";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { PLATEAU_API_URL, PROJECT_ID } from "../../constants";
import { SHARED_STORE } from "../../sharedAtoms";
import { shareAtom } from "../../states/share";
import Modal from "../../ui-components/ShareModal";

type Props = {
  showShareModal: boolean;
  setShowShareModal: (val: boolean) => void;
};

const getHrefWithoutQuery = () => {
  const url = new URL(window.location.href);
  return url.origin + url.pathname;
};

const ShareModal: FC<Props> = ({ showShareModal, setShowShareModal }) => {
  const shareState = useSetAtom(shareAtom);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [shareId, setShareId] = useState("");
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setIsError(false);
      await shareState();
      setShareId(
        await fetch(`${PLATEAU_API_URL}/share/${PROJECT_ID}`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(await SHARED_STORE),
        })
          .then(r => (r.status === 200 ? r.json() : ""))
          .catch(() => {
            setIsError(true);
          }),
      );
      setLoading(false);
    };
    if (showShareModal) {
      run();
    } else {
      setLoading(false);
    }
  }, [showShareModal, shareState]);

  const onClose = useCallback(() => {
    setShowShareModal(false);
    setLoading(false);
  }, [setShowShareModal]);

  const url = useMemo(() => `${getHrefWithoutQuery()}?share=${shareId}`, [shareId]);
  const iframe = useMemo(() => `<iframe src="${url}" />`, [url]);
  return (
    <Modal
      show={showShareModal}
      onClose={onClose}
      url={url}
      iframe={iframe}
      loading={loading}
      isError={isError}
    />
  );
};

export default ShareModal;
