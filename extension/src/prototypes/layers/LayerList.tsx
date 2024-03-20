import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { styled, Button } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import {
  forwardRef,
  useCallback,
  type ComponentPropsWithRef,
  type ComponentType,
  type ElementType,
} from "react";
import invariant from "tiny-invariant";

import { rootLayersLayerAtomsAtom } from "../../shared/states/rootLayer";

import { LayerListItem } from "./LayerListItem";
import { layerIdsAtom, moveLayerAtom, removeLayerAtom } from "./states";
import { type LayerProps } from "./types";

const Root = styled("div")({});

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const LayerListActions = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
  padding: theme.spacing(0, 1),
}));

const LayerListActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(0, 1),
  fontSize: theme.typography.body2.fontSize,
}));

export type LayerListProps<C extends ElementType = typeof Root> = ComponentPropsWithRef<C> & {
  component?: C;
  itemComponent: ComponentType<LayerProps>;
  unmountWhenEmpty?: boolean;
  minimumDragDistance?: number;
};

export const LayerList = forwardRef<HTMLDivElement, LayerListProps>(
  (
    { unmountWhenEmpty = false, minimumDragDistance = 5, component, itemComponent, ...props },
    ref,
  ) => {
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: minimumDragDistance,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    );

    const layerAtoms = useAtomValue(rootLayersLayerAtomsAtom);
    const layerIds = useAtomValue(layerIdsAtom);
    const move = useSetAtom(moveLayerAtom);

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        if (event.over == null || event.active.id === event.over.id) {
          return;
        }
        invariant(typeof event.active.id === "string");
        invariant(typeof event.over.id === "string");
        move(event.active.id, event.over.id);
      },
      [move],
    );

    const remove = useSetAtom(removeLayerAtom);
    const handleRemoveAllLayers = useCallback(() => {
      for (const layerId of layerIds) {
        remove(layerId);
      }
    }, [layerIds, remove]);

    if (unmountWhenEmpty && layerAtoms.length === 0) {
      return null;
    }
    const Component = component ?? Root;
    return (
      <Component ref={ref} {...props}>
        <Wrapper>
          <div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}>
              <SortableContext items={layerIds} strategy={verticalListSortingStrategy}>
                {layerAtoms.map((layerAtom, index) => (
                  // Technically key can be coerced string of atom, but dnd-kit
                  // disagree with it.
                  <LayerListItem
                    key={layerIds[index]}
                    index={index}
                    layerAtom={layerAtom}
                    itemComponent={itemComponent}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
          <LayerListActions>
            <LayerListActionButton variant="outlined" onClick={handleRemoveAllLayers}>
              全てを削除
            </LayerListActionButton>
          </LayerListActions>
        </Wrapper>
      </Component>
    );
  },
) as <C extends ElementType>(props: LayerListProps<C>) => JSX.Element; // For generics
