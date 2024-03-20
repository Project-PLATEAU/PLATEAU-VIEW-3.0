import styled from "@emotion/styled";
import { useState, useCallback, Dispatch, SetStateAction } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Space from "@reearth-cms/components/atoms/Space";
import {
  DefaultFilterValueType,
  DropdownFilterType,
} from "@reearth-cms/components/molecules/Content/Table/types";
import { AndConditionInput } from "@reearth-cms/components/molecules/View/types";
import { CurrentViewType } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";

import DropdownRender from "./DropdownRender";

type Props = {
  filter: DropdownFilterType;
  index: number;
  defaultValue: DefaultFilterValueType;
  filterRemove: (index: number) => void;
  isFilterOpen: boolean;
  currentView?: CurrentViewType;
  setCurrentView?: Dispatch<SetStateAction<CurrentViewType>>;
  onFilterChange?: (filter?: AndConditionInput) => void;
};

const FilterDropdown: React.FC<Props> = ({
  filter,
  index,
  defaultValue: value,
  filterRemove,
  isFilterOpen,
  currentView,
  setCurrentView,
  onFilterChange,
}) => {
  const [open, setOpen] = useState(isFilterOpen);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  const remove = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      filterRemove(index);
    },
    [index, filterRemove],
  );

  return (
    <Dropdown
      key={filter.title}
      dropdownRender={() => (
        <DropdownRender
          filter={filter}
          index={index}
          close={close}
          defaultValue={value}
          open={open}
          isFilter={true}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onFilterChange={onFilterChange}
        />
      )}
      trigger={["click"]}
      placement="bottomLeft"
      arrow={false}
      open={open}
      onOpenChange={handleOpenChange}>
      <Badge offset={[-3, 3]} color="blue" dot>
        <StyledButton type="text">
          <Space size={10}>
            {filter.title}
            <div onClick={remove}>
              <StyledIcon icon="close" size={12} />
            </div>
          </Space>
        </StyledButton>
      </Badge>
    </Dropdown>
  );
};

export default FilterDropdown;

const StyledButton = styled(Button)`
  color: rgba(0, 0, 0, 0.45);
  background-color: #f8f8f8;
  margin: 0 5px;
`;

const StyledIcon = styled(Icon)`
  color: rgba(0, 0, 0, 0.45);
  :hover {
    color: rgba(0, 0, 0, 0.85);
  }
`;
