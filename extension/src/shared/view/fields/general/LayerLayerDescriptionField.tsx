import { useAtom } from "jotai";
import { FC } from "react";
import Markdown from "react-markdown";

import { ParameterList } from "../../../../prototypes/ui-components";
import { LayerDescriptionField } from "../../../types/fieldComponents/general";
import { CommonContentWrapper } from "../../../ui-components/CommonContentWrapper";
import { WritableAtomForComponent } from "../../../view-layers/component";

export interface LayerLayerDescriptionFieldProps {
  atoms: WritableAtomForComponent<LayerDescriptionField>[];
}

export const LayerLayerDescriptionField: FC<LayerLayerDescriptionFieldProps> = ({ atoms }) => {
  const [component] = useAtom(atoms[0]);
  return component.preset?.description ? (
    <ParameterList>
      <CommonContentWrapper>
        <Markdown skipHtml components={{ a: LinkRenderer }}>{component.preset?.description}</Markdown>
      </CommonContentWrapper>
    </ParameterList>
  ) : null;
};

function LinkRenderer(props: any) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}
