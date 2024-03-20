import { Button, styled } from "@mui/material";
import { atom, useAtom, useAtomValue } from "jotai";
import { FC, useCallback, useMemo } from "react";

import { ARIcon } from "../../../prototypes/ui-components";
import { LightThemeOverride } from "../../../prototypes/ui-components/LightThemeOverride";
import { showARModalAtom } from "../../../prototypes/view/states/app";
import { rootLayersAtom } from "../../states/rootLayer";
import SharedModal from "../../ui-components/Modal";

type ARModalProps = {
  arURL: string | undefined;
};

const ARModal: FC<ARModalProps> = ({ arURL }) => {
  const [showARModal, setShowARModal] = useAtom(showARModalAtom);

  const rootLayersForAR = useAtomValue(
    useMemo(
      () =>
        atom(get => {
          return get(rootLayersAtom)
            .map(({ id, ...rest }) =>
              rest.type === "dataset"
                ? {
                    datasetId: id,
                    dataId: get(rest.currentDataIdAtom),
                  }
                : undefined,
            )
            .filter(Boolean);
        }),
      [],
    ),
  );

  const handleARLinkClick = useCallback(() => {
    const url = arURL + "?dataList=" + encodeURI(JSON.stringify(rootLayersForAR));
    window.open(url, "_blank", "noopener,noreferrer");
  }, [arURL, rootLayersForAR]);

  const handleClose = useCallback(() => {
    setShowARModal(false);
  }, [setShowARModal]);

  return (
    <LightThemeOverride>
      <SharedModal
        isVisible={showARModal}
        title="PLATEAU VIEW AR"
        titleIcon={<ARIcon />}
        onClose={handleClose}>
        <ContentWrapper>
          <Description>
            リンク先のPLATEAU VIEW
            ARは試験的に運用されており、安定した動作を保証するものではありません。
          </Description>
          <StyledButton
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleARLinkClick}
            disabled={!arURL}>
            PLATEAU VIEW AR へ
          </StyledButton>
        </ContentWrapper>
      </SharedModal>
    </LightThemeOverride>
  );
};

export default ARModal;

const ContentWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(1.5, 3, 3, 3),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const Description = styled("div")(({ theme }) => ({
  ...theme.typography.body1,
}));

const StyledButton = styled(Button)(() => ({
  color: "#fff",
}));
