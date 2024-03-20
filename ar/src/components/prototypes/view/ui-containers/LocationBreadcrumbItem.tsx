import { groupBy } from "lodash";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useCallback, useId, useMemo, useState, type FC, type MouseEvent } from "react";
import invariant from "tiny-invariant";

import { useAreaDatasets } from "../../../shared/graphql";
import { Area } from "../../../shared/states/address";
import { isNotNullish } from "../../type-helpers";
import { AppBreadcrumbsItem, ContextBar, OverlayPopper } from "../../ui-components";
import { datasetTypeOrder } from "../constants/datasetTypeOrder";
import { PlateauDatasetType } from "../constants/plateau";

import { BuildingDatasetButtonSelect } from "./BuildingDatasetButtonSelect";
import { DefaultDatasetButton } from "./DefaultDatasetButton";
import { DefaultDatasetSelect } from "./DefaultDatasetSelect";

export interface LocationBreadcrumbItemProps {
  area: Area;
}

export const LocationBreadcrumbItem: FC<LocationBreadcrumbItemProps> = ({ area }) => {
  const query = useAreaDatasets(area.code, {
    excludeTypes: [PlateauDatasetType.UseCase, PlateauDatasetType.GenericCityObject],
  });

  const datasetGroups = useMemo(() => {
    const datasets = query.data?.area?.datasets;
    if (!datasets) {
      return;
    }
    const isPrefecture = area.code.length === 2;
    const isCity = area.code.length === 5 && area.code.endsWith("00");
    const isWard = area.code.length === 5 && !area.code.endsWith("00");
    const groups = Object.entries(
      groupBy(
        datasets.filter(d =>
          isPrefecture
            ? !d.cityCode && area.code === d.prefectureCode
            : isCity
            ? !d.wardCode && d.cityCode === area.code
            : isWard
            ? d.wardCode && d.wardCode === area.code
            : false,
        ),
        d => d.type.code,
      ),
    );
    return datasetTypeOrder
      .map(orderedType => groups.find(([type]) => type === orderedType))
      .filter(isNotNullish)
      .map(([, datasets]) => datasets);
  }, [query.data, area.code]);

  const [expanded, setExpanded] = useState(false);
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
    setExpanded(false);
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
