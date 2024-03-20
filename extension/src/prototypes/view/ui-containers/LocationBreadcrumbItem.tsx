import { groupBy, unionBy } from "lodash-es";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useCallback, useId, useMemo, useState, type FC, type MouseEvent } from "react";
import invariant from "tiny-invariant";

import { useAreaDatasets, useDatasetTypes } from "../../../shared/graphql";
import { Area } from "../../../shared/states/address";
import { isNotNullish } from "../../type-helpers";
import { AppBreadcrumbsItem, ContextBar, OverlayPopper } from "../../ui-components";
import { PlateauDatasetType } from "../constants/plateau";

import { BuildingDatasetButtonSelect } from "./BuildingDatasetButtonSelect";
import { DefaultDatasetButton } from "./DefaultDatasetButton";
import { DefaultDatasetSelect } from "./DefaultDatasetSelect";

export interface LocationBreadcrumbItemProps {
  area: Area;
}

export const LocationBreadcrumbItem: FC<LocationBreadcrumbItemProps> = ({ area }) => {
  const { data: datasetTypeOrder } = useDatasetTypes();
  const filteredDatasetTypeOrder = useMemo(
    () => unionBy(datasetTypeOrder, "name"),
    [datasetTypeOrder],
  );
  const query = useAreaDatasets(area.code);

  const datasetGroups = useMemo(() => {
    const datasets = query.data?.area?.datasets;
    if (!datasets) {
      return;
    }
    const groups = Object.entries(
      groupBy(
        datasets.filter(d =>
          !d.cityCode
            ? d.prefectureCode === area.code
            : !d.wardCode
            ? d.cityCode === area.code
            : d.wardCode === area.code,
        ),
        d => d.type.name,
      ),
    );

    return filteredDatasetTypeOrder
      ?.map(orderedType => groups.find(([type]) => type === orderedType.name))
      .filter(isNotNullish)
      .map(([, datasets]) => datasets);
  }, [query.data, area.code, filteredDatasetTypeOrder]);

  const [expanded, setExpanded] = useState(true);
  const handleCollapse = useCallback(() => {
    setExpanded(false);
  }, []);
  const handleExpand = useCallback(() => {
    setExpanded(true);
  }, []);

  const id = useId();
  const popupState = usePopupState({
    variant: "popover",
    popupId: id,
  });
  const popoverProps = bindPopover(popupState);
  const triggerProps = bindTrigger(popupState);
  const { open, onClose } = popoverProps;
  const { close } = popupState;
  const { onClick } = triggerProps;

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (open) {
        close();
      } else {
        onClick(event);
      }
    },
    [open, close, onClick],
  );
  const handleClose = useCallback(() => {
    onClose();
    setExpanded(true);
  }, [onClose]);

  const hasDatasets = datasetGroups != null && datasetGroups.length > 0;

  return (
    <>
      <AppBreadcrumbsItem
        dropDown={hasDatasets}
        disabled={!hasDatasets}
        {...triggerProps}
        onClick={handleClick}>
        {area.name}
      </AppBreadcrumbsItem>
      {hasDatasets && (
        <OverlayPopper {...popoverProps} inset={1.5} onClose={handleClose}>
          <ContextBar expanded={expanded} onCollapse={handleCollapse} onExpand={handleExpand}>
            {datasetGroups.map(datasets => {
              if (datasets.length > 1) {
                return (
                  <DefaultDatasetSelect
                    key={datasets[0].id}
                    datasets={datasets}
                    municipalityCode={area.code}
                  />
                );
              }
              invariant(datasets.length === 1);
              const [dataset] = datasets;
              return dataset.type.code === PlateauDatasetType.Building ? (
                <BuildingDatasetButtonSelect
                  key={dataset.id}
                  dataset={dataset}
                  municipalityCode={area.code}
                />
              ) : dataset.items.length === 1 ? (
                <DefaultDatasetButton
                  key={dataset.id}
                  dataset={dataset}
                  municipalityCode={area.code}
                />
              ) : (
                <DefaultDatasetSelect
                  key={dataset.id}
                  datasets={[dataset]}
                  municipalityCode={area.code}
                />
              );
            })}
          </ContextBar>
        </OverlayPopper>
      )}
    </>
  );
};
