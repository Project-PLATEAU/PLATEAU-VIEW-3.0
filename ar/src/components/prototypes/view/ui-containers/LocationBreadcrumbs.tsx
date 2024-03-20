import { useAtomValue } from "jotai";
import { type FC } from "react";

import { areasAtom } from "../../../shared/states/address";
import { AppBreadcrumbs } from "../../ui-components";

import { LocationBreadcrumbItem } from "./LocationBreadcrumbItem";

export const LocationBreadcrumbs: FC = () => {
  const areas = useAtomValue(areasAtom);
  if (areas == null) {
    return null;
  }
  return (
    <AppBreadcrumbs>
      {[...areas].reverse().map(area => (
        <LocationBreadcrumbItem key={area.code} area={area} />
      ))}
    </AppBreadcrumbs>
  );
};
