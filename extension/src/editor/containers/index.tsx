import { type FC, useState, useMemo, useCallback, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { EditorFieldComponentsTemplateSection } from "./component-template";
import { EditorDatasetSection } from "./dataset";
import { EditorInspectorEmphasisPropertyTemplateSection } from "./emphasis-property-template";
import { EditorBar, EditorPanel } from "./ui-components";
import { EditorNotice, EditorNoticeRef } from "./ui-components/editor/EditorNotice";
import useCache from "./useCache";

export const PLATEAUVIEW_EDITOR_DOM_ID = "__plateauview_editor__";

export const Editor: FC = () => {
  const [editorType, setEditorType] = useState("dataset");

  const editorTypes = useMemo(
    () => [
      {
        title: "Dataset Editor",
        value: "dataset",
      },
      {
        title: "Field Components Template Editor",
        value: "fieldComponentsTemplate",
      },
      {
        title: "Inspector Emphasis Property Template Editor",
        value: "inspectorEmphasisPropertyTemplate",
      },
    ],
    [],
  );

  const handleEditorTypeChange = useCallback((editorType: string) => {
    setEditorType(editorType);
  }, []);

  const cache = useCache();

  const editorNoticeRef = useRef<EditorNoticeRef>(null);

  return (
    <div id={PLATEAUVIEW_EDITOR_DOM_ID}>
      <DndProvider backend={HTML5Backend}>
        <EditorBar
          editorTypes={editorTypes}
          editorType={editorType}
          onEditorTypeChange={handleEditorTypeChange}
        />
        <EditorPanel>
          {editorType === "dataset" ? (
            <EditorDatasetSection cache={cache} editorNoticeRef={editorNoticeRef} />
          ) : editorType === "fieldComponentsTemplate" ? (
            <EditorFieldComponentsTemplateSection editorNoticeRef={editorNoticeRef} />
          ) : editorType === "inspectorEmphasisPropertyTemplate" ? (
            <EditorInspectorEmphasisPropertyTemplateSection editorNoticeRef={editorNoticeRef} />
          ) : null}
          <EditorNotice ref={editorNoticeRef} />
        </EditorPanel>
      </DndProvider>
    </div>
  );
};
