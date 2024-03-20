import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BasicFieldProps } from "..";
import { CameraPosition } from "../../../../../../shared/reearth/types";
import { generateID } from "../../../../../../shared/utils/id";
import {
  PropertyBox,
  PropertyButton,
  PropertyCard,
  PropertyInputField,
  PropertyItemWrapper,
  PropertyTextareaField,
  PropertyWrapper,
  PropertyCameraInput,
} from "../../../../ui-components";

type DatasetStoryPage = {
  id: string;
  title?: string;
  camera?: CameraPosition;
  content?: string;
};

export type DatasetStoryFieldPreset = {
  pages: DatasetStoryPage[];
};

export const EditorDatasetStoryField: React.FC<BasicFieldProps<"DATASET_STORY_FIELD">> = ({
  component,
  onUpdate,
}) => {
  const [currentPageId, setCurrentPageId] = useState<string>();
  const [movingId, setMovingId] = useState<string>();
  useEffect(() => {
    if (movingId) {
      setTimeout(() => {
        if (movingId) setMovingId(undefined);
      }, 200);
    }
  }, [movingId]);

  const pages = useMemo(() => {
    return component?.preset?.pages ?? [];
  }, [component]);

  const currentPage = useMemo(() => {
    return pages.find(p => p.id === currentPageId);
  }, [pages, currentPageId]);

  const handlePageCreate = useCallback(() => {
    const newPage: DatasetStoryPage = {
      id: generateID(),
    };
    onUpdate?.({
      ...component,
      preset: {
        ...component?.preset,
        pages: [...pages, newPage],
      },
    });
  }, [component, pages, onUpdate]);

  const handlePageUpdate = useCallback(
    (page: DatasetStoryPage) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          pages: pages.map(p => (p.id === page.id ? page : p)),
        },
      });
    },
    [component, pages, onUpdate],
  );

  const handlePageMove = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = pages.findIndex(r => r.id === id);
      if (index === -1) return;
      setMovingId(id);
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= pages.length) return;
      const newPages = [...pages];
      newPages.splice(index, 1);
      newPages.splice(newIndex, 0, pages[index]);
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          pages: newPages,
        },
      });
    },
    [component, pages, onUpdate],
  );

  const handlePageRemove = useCallback(
    (id: string) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          pages: pages.filter(p => p.id !== id),
        },
      });
    },
    [component, pages, onUpdate],
  );

  const handlePageSelect = useCallback((id: string) => {
    setCurrentPageId(id);
  }, []);

  const handleCameraChange = useCallback(
    (camera: CameraPosition) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          pages: pages.map(p => (p.id === currentPageId ? { ...p, camera } : p)),
        },
      });
    },
    [component, currentPageId, pages, onUpdate],
  );

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate?.({
        ...component,
        preset: {
          ...component?.preset,
          pages: pages.map(p => (p.id === currentPageId ? { ...p, content: e.target.value } : p)),
        },
      });
    },
    [component, currentPageId, pages, onUpdate],
  );

  return (
    <PropertyWrapper>
      <PropertyBox asMenu>
        {pages.map((page, index) => (
          <PropertyCard
            key={page.id}
            id={page.id}
            selected={page.id === currentPageId}
            movingId={movingId}
            moveUpDisabled={index === 0}
            moveDownDisabled={index === pages.length - 1}
            onMove={handlePageMove}
            onRemove={handlePageRemove}
            onSelect={handlePageSelect}
            mainPanel={<PagePanel page={page} onPageUpdate={handlePageUpdate} />}
          />
        ))}
        <PropertyButton onClick={handlePageCreate}>
          <AddOutlinedIcon /> Page
        </PropertyButton>
      </PropertyBox>
      <PropertyBox>
        {currentPage && (
          <>
            <PropertyCameraInput
              key={currentPage.id}
              value={currentPage?.camera}
              onChange={handleCameraChange}
            />
            <PropertyItemWrapper label="Content">
              <PropertyTextareaField
                key={currentPage.id}
                value={currentPage?.content ?? ""}
                onChange={handleContentChange}
              />
            </PropertyItemWrapper>
          </>
        )}
      </PropertyBox>
    </PropertyWrapper>
  );
};

type PagePanelProps = {
  page: DatasetStoryPage;
  onPageUpdate: (page: DatasetStoryPage) => void;
};

const PagePanel: React.FC<PagePanelProps> = ({ page, onPageUpdate }) => {
  const handlePageTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPageUpdate({
        ...page,
        title: e.target.value,
      });
    },
    [page, onPageUpdate],
  );

  return (
    <PropertyInputField
      placeholder="Title"
      value={page.title ?? ""}
      onChange={handlePageTitleChange}
    />
  );
};
