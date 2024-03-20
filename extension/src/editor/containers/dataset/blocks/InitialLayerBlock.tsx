import { useCallback, useMemo } from "react";

import { DraftSetting, EditorDataset, UpdateSetting } from "..";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorCommonField,
  EditorSwitch,
} from "../../ui-components";

type InitialLayerBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  dataset?: EditorDataset;
  updateSetting?: UpdateSetting;
};

export const InitialLayerBlock: React.FC<InitialLayerBlockProps> = ({
  setting,
  updateSetting,
  ...props
}) => {
  const isInitialLayer = useMemo(
    () => !!setting?.general?.initialLayer?.isInitialLayer,
    [setting?.general?.initialLayer?.isInitialLayer],
  );

  const handleInitialLayerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      updateSetting?.(s => {
        if (!s) return s;
        return {
          ...s,
          general: {
            ...s.general,
            initialLayer: e.target.checked
              ? {
                  isInitialLayer: e.target.checked,
                }
              : undefined,
          },
        };
      }),
    [updateSetting],
  );

  return (
    <EditorBlock title="Initial Layer" expandable {...props}>
      <BlockContentWrapper>
        <EditorCommonField label="Load this layer on project load" inline>
          <EditorSwitch checked={isInitialLayer} onChange={handleInitialLayerChange} />
        </EditorCommonField>
      </BlockContentWrapper>
    </EditorBlock>
  );
};
