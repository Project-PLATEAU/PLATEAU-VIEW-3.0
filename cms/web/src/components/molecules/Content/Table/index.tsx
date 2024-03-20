import { ColumnsState } from "@ant-design/pro-table";
import styled from "@emotion/styled";
import React, {
  Key,
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { Link } from "react-router-dom";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import {
  TableRowSelection,
  TablePaginationConfig,
  ListToolBarProps,
} from "@reearth-cms/components/atoms/ProTable";
import Space from "@reearth-cms/components/atoms/Space";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import LinkItemRequestModal from "@reearth-cms/components/molecules/Content/LinkItemRequestModal/LinkItemRequestModal";
import {
  ColorType,
  StateType,
  DefaultFilterValueType,
  DropdownFilterType,
  ExtendedColumns,
} from "@reearth-cms/components/molecules/Content/Table/types";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import {
  ItemSort,
  FieldType,
  Column,
  AndConditionInput,
} from "@reearth-cms/components/molecules/View/types";
import { CurrentViewType } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import DropdownRender from "./DropdownRender";
import FilterDropdown from "./filterDropdown";

type Props = {
  className?: string;
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ExtendedColumns[];
  loading: boolean;
  selectedItem: Item | undefined;
  selection: {
    selectedRowKeys: string[];
  };
  totalCount: number;
  currentView: CurrentViewType;
  setCurrentView: Dispatch<SetStateAction<CurrentViewType>>;
  searchTerm: string;
  page: number;
  pageSize: number;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onSearchTerm: (term?: string) => void;
  onFilterChange: (filter?: AndConditionInput) => void;
  onContentTableChange: (page: number, pageSize: number, sorter?: ItemSort) => void;
  onItemSelect: (itemId: string) => void;
  setSelection: (input: { selectedRowKeys: string[] }) => void;
  onItemEdit: (itemId: string) => void;
  onItemDelete: (itemIds: string[]) => Promise<void>;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  onItemsReload: () => void;
  requests: Request[];
  addItemToRequestModalShown: boolean;
  onAddItemToRequest: (request: Request, itemIds: string[]) => void;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  modelKey?: string;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableReload: () => void;
};

const ContentTable: React.FC<Props> = ({
  contentTableFields,
  contentTableColumns,
  loading,
  selectedItem,
  selection,
  totalCount,
  currentView,
  page,
  pageSize,
  requests,
  addItemToRequestModalShown,
  setCurrentView,
  onRequestTableChange,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  onAddItemToRequest,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onUnpublish,
  onSearchTerm,
  onFilterChange,
  onContentTableChange,
  onItemSelect,
  setSelection,
  onItemDelete,
  onItemsReload,
  modelKey,
  onRequestSearchTerm,
  onRequestTableReload,
}) => {
  const [currentWorkspace] = useWorkspace();
  const t = useT();

  const actionsColumns: ExtendedColumns[] = useMemo(() => {
    const sortOrderGet = (key: FieldType) => {
      return currentView.sort?.field.type === key
        ? currentView.sort.direction === "ASC"
          ? "ascend"
          : "descend"
        : null;
    };

    return [
      {
        render: (_, contentField) => (
          <Link to={`details/${contentField.id}`}>
            <Icon icon="edit" />
          </Link>
        ),
        dataIndex: "editIcon",
        fieldType: "EDIT_ICON",
        key: "EDIT_ICON",
        width: 48,
        minWidth: 48,
        ellipsis: true,
        align: "center",
      },
      {
        title: () => <Icon icon="message" />,
        dataIndex: "commentsCount",
        fieldType: "commentsCount",
        key: "commentsCount",
        render: (_, item) => {
          return (
            <StyledButton type="link" onClick={() => onItemSelect(item.id)}>
              <CustomTag
                value={item.comments?.length || 0}
                color={item.id === selectedItem?.id ? "#87e8de" : undefined}
              />
            </StyledButton>
          );
        },
        width: 48,
        minWidth: 48,
        ellipsis: true,
        align: "center",
      },
      {
        title: t("Status"),
        dataIndex: "Status",
        fieldType: "STATUS",
        key: "STATUS",
        render: (_, item) => {
          const itemStatus: StateType[] = item.status.split("_") as StateType[];
          return (
            <>
              {itemStatus.map((state, index) => {
                if (index === itemStatus.length - 1) {
                  return <StyledBadge key={index} color={stateColors[state]} text={t(state)} />;
                } else {
                  return <StyledBadge key={index} color={stateColors[state]} />;
                }
              })}
            </>
          );
        },
        width: 148,
        minWidth: 148,
        ellipsis: true,
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        fieldType: "CREATION_DATE",
        key: "CREATION_DATE",
        sortOrder: sortOrderGet("CREATION_DATE"),
        render: (_, item) => dateTimeFormat(item.createdAt),
        sorter: true,
        defaultSortOrder: sortOrderGet("CREATION_DATE"),
        width: 148,
        minWidth: 148,
        ellipsis: true,
        type: "Date",
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy",
        fieldType: "CREATION_USER",
        key: "CREATION_USER",
        sortOrder: sortOrderGet("CREATION_USER"),
        render: (_, item) => (
          <Space>
            <UserAvatar username={item.createdBy} size={"small"} />
            {item.createdBy}
          </Space>
        ),
        sorter: true,
        defaultSortOrder: sortOrderGet("CREATION_USER"),
        width: 148,
        minWidth: 148,
        type: "Person",
        ellipsis: true,
      },
      {
        title: t("Updated At"),
        dataIndex: "updatedAt",
        fieldType: "MODIFICATION_DATE",
        key: "MODIFICATION_DATE",
        sortOrder: sortOrderGet("MODIFICATION_DATE"),
        render: (_, item) => dateTimeFormat(item.updatedAt),
        sorter: true,
        defaultSortOrder: sortOrderGet("MODIFICATION_DATE"),
        width: 148,
        minWidth: 148,
        ellipsis: true,
        type: "Date",
      },
      {
        title: t("Updated By"),
        dataIndex: "updatedBy",
        fieldType: "MODIFICATION_USER",
        key: "MODIFICATION_USER",
        sortOrder: sortOrderGet("MODIFICATION_USER"),
        render: (_, item) =>
          item.updatedBy ? (
            <Space>
              <UserAvatar username={item.updatedBy} size={"small"} />
              {item.updatedBy}
            </Space>
          ) : (
            "-"
          ),
        sorter: true,
        defaultSortOrder: sortOrderGet("MODIFICATION_USER"),
        width: 148,
        minWidth: 148,
        type: "Person",
        ellipsis: true,
      },
    ];
  }, [t, currentView.sort, selectedItem?.id, onItemSelect]);

  const tableColumns = useMemo(() => {
    return contentTableColumns ? [...actionsColumns, ...contentTableColumns] : [...actionsColumns];
  }, [actionsColumns, contentTableColumns]);

  const rowSelection: TableRowSelection = useMemo(
    () => ({
      selectedRowKeys: selection.selectedRowKeys,
      onChange: (selectedRowKeys: Key[]) => {
        setSelection({
          ...selection,
          selectedRowKeys: selectedRowKeys as string[],
        });
      },
    }),
    [selection, setSelection],
  );

  const AlertOptions = useCallback(
    (props: any) => {
      return (
        <Space size={16}>
          <PrimaryButton onClick={() => onAddItemToRequestModalOpen()}>
            <Icon icon="plus" /> {t("Add to Request")}
          </PrimaryButton>
          <PrimaryButton onClick={() => onUnpublish(props.selectedRowKeys)}>
            <Icon icon="eyeInvisible" /> {t("Unpublish")}
          </PrimaryButton>
          <PrimaryButton onClick={props.onCleanSelected}>
            <Icon icon="clear" /> {t("Deselect")}
          </PrimaryButton>
          <DeleteButton onClick={() => onItemDelete?.(props.selectedRowKeys)}>
            <Icon icon="delete" /> {t("Delete")}
          </DeleteButton>
        </Space>
      );
    },
    [onAddItemToRequestModalOpen, onItemDelete, onUnpublish, t],
  );

  const defaultFilterValues = useRef<DefaultFilterValueType[]>([]);

  const [filters, setFilters] = useState<DropdownFilterType[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<DropdownFilterType>();
  const filterRemove = useCallback(
    (index: number) => {
      setFilters(prev => {
        prev.splice(index, 1);
        return prev;
      });
      defaultFilterValues.current.splice(index, 1);
      const currentFilters = currentView.filter ? [...currentView.filter.conditions] : [];
      currentFilters.splice(index, 1);
      onFilterChange(currentFilters.length > 0 ? { conditions: currentFilters } : undefined);
    },
    [currentView.filter, onFilterChange],
  );

  useEffect(() => {
    if (currentView.filter && contentTableColumns) {
      const newFilters: DropdownFilterType[] = [];
      const newDefaultValues = [];
      for (const c of currentView.filter.conditions) {
        const condition = Object.values(c)[0];
        if (!condition || !("operator" in condition)) break;
        const { operator, fieldId } = condition;
        const value = "value" in condition ? condition?.value : "";
        const operatorType = Object.keys(c)[0];
        const columns =
          fieldId.type === "FIELD" || fieldId.type === "META_FIELD"
            ? contentTableColumns
            : actionsColumns;
        const column = columns.find(c => c.key === fieldId.id);
        if (column) {
          const { dataIndex, title, type, typeProperty, key, required, multiple } = column;
          const members = currentWorkspace?.members;
          if (
            dataIndex &&
            title &&
            type &&
            typeProperty &&
            key &&
            required !== undefined &&
            multiple !== undefined &&
            members
          ) {
            newFilters.push({
              dataIndex: dataIndex as string | string[],
              title: title as string,
              type,
              typeProperty,
              members,
              id: key as string,
              required,
              multiple,
            });
            newDefaultValues.push({ operatorType, operator, value });
          }
        }
      }
      setFilters(newFilters);
      defaultFilterValues.current = newDefaultValues;
    } else {
      setFilters([]);
      defaultFilterValues.current = [];
    }
    isFilterOpen.current = false;
  }, [currentView.filter, contentTableColumns, actionsColumns, currentWorkspace?.members]);

  const isFilter = useRef<boolean>(true);
  const [controlMenuOpen, setControlMenuOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [conditionMenuOpen, setConditionMenuOpen] = useState(false);

  const handleControlMenuOpenChange = useCallback((open: boolean) => {
    setControlMenuOpen(open);
  }, []);

  const handleOptionsOpenChange = useCallback((open: boolean) => {
    setControlMenuOpen(false);
    setOptionsOpen(open);
  }, []);

  const handleConditionMenuOpenChange = useCallback((open: boolean) => {
    setConditionMenuOpen(open);
  }, []);

  const close = useCallback(() => {
    setConditionMenuOpen(false);
  }, []);

  const getOptions = useCallback(
    (isFromMenu: boolean): MenuProps["items"] => {
      const optionClick = (isFilter: boolean, column: ExtendedColumns) => {
        const { dataIndex, title, type, typeProperty, key, required, multiple } = column;
        const members = currentWorkspace?.members;
        if (
          dataIndex &&
          title &&
          type &&
          typeProperty &&
          key &&
          required !== undefined &&
          multiple !== undefined &&
          members
        ) {
          const filter: DropdownFilterType = {
            dataIndex: dataIndex as string | string[],
            title: title as string,
            type,
            typeProperty,
            members,
            id: key as string,
            required,
            multiple,
          };
          if (isFilter) {
            setFilters(prevState => [...prevState, filter]);
          }
          setSelectedFilter(filter);
          handleOptionsOpenChange(false);
          if (isFromMenu) {
            handleConditionMenuOpenChange(true);
            isFilterOpen.current = false;
          } else {
            isFilterOpen.current = true;
          }
        }
      };

      return [
        // TODO: Uncomment this when we have a way to filter by creation/modification date
        // ...((actionsColumns ?? [])
        //   .filter(column => column.key === "CREATION_DATE" || column.key === "MODIFICATION_DATE")
        //   .map(column => ({
        //     key: column.key,
        //     label: column.title,
        //     onClick: () => {
        //       optionClick(isFilter.current, column);
        //     },
        //   })) as any),
        ...((contentTableColumns ?? [])
          .filter(
            column => column.type !== "Group" && column.type !== "Reference" && !column.multiple,
          )
          .map(column => ({
            key: column.key,
            label: column.title,
            onClick: () => {
              optionClick(isFilter.current, column);
            },
          })) as any),
      ];
    },
    [
      contentTableColumns,
      currentWorkspace?.members,
      handleConditionMenuOpenChange,
      handleOptionsOpenChange,
    ],
  );

  const toolBarItemClick = useCallback(
    (isFilterMode: boolean) => {
      setInputValue("");
      setItems(getOptions(true));
      isFilter.current = isFilterMode;
      handleOptionsOpenChange(true);
    },
    [getOptions, handleOptionsOpenChange],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      const reg = new RegExp(e.target.value, "i");
      const result = getOptions(optionsOpen)?.filter(item => {
        if (item && "label" in item && typeof item.label === "string") {
          return reg.test(item.label);
        }
      });
      setItems(result);
    },
    [getOptions, optionsOpen],
  );

  const isFilterOpen = useRef(false);
  const defaultItems = getOptions(false);
  const [items, setItems] = useState<MenuProps["items"]>(defaultItems);
  const [inputValue, setInputValue] = useState("");

  const sharedProps = useMemo(
    () => ({
      menu: { items },
      dropdownRender: (menu: React.ReactNode): React.ReactNode => (
        <Wrapper>
          <InputWrapper>
            <Input
              value={inputValue}
              placeholder={isFilter.current ? "Filter by..." : "Sort by..."}
              onChange={handleChange}
            />
          </InputWrapper>
          {React.cloneElement(menu as React.ReactElement, { style: menuStyle })}
        </Wrapper>
      ),
      arrow: false,
    }),
    [handleChange, inputValue, items],
  );

  const handleToolbarEvents: ListToolBarProps = useMemo(
    () => ({
      search: (
        <StyledSearchContainer>
          <StyledSearchInput
            allowClear
            placeholder={t("input search text")}
            onSearch={(value: string) => {
              onSearchTerm(value);
            }}
            key={`${modelKey}${currentView.id}`}
          />
          <StyledFilterWrapper>
            <StyledFilterSpace size={[0, 8]}>
              {filters.map((filter, index) => (
                <FilterDropdown
                  key={index}
                  filter={filter}
                  defaultValue={defaultFilterValues.current[index]}
                  index={index}
                  filterRemove={filterRemove}
                  isFilterOpen={isFilterOpen.current}
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  onFilterChange={onFilterChange}
                />
              ))}
            </StyledFilterSpace>
            <Dropdown
              {...sharedProps}
              placement="bottomLeft"
              trigger={["click"]}
              onOpenChange={() => {
                isFilter.current = true;
                setInputValue("");
                setItems(defaultItems);
              }}>
              <StyledFilterButton type="text" icon={<Icon icon="plus" />}>
                Filter
              </StyledFilterButton>
            </Dropdown>
          </StyledFilterWrapper>
        </StyledSearchContainer>
      ),
    }),
    [
      currentView,
      defaultItems,
      filterRemove,
      filters,
      modelKey,
      onFilterChange,
      onSearchTerm,
      setCurrentView,
      sharedProps,
      t,
    ],
  );

  const pagination: TablePaginationConfig = useMemo(
    () => ({
      showSizeChanger: true,
      current: page,
      total: totalCount,
      pageSize: pageSize,
    }),
    [page, pageSize, totalCount],
  );

  const options = useMemo(
    () => ({
      search: true,
      fullScreen: true,
      reload: onItemsReload,
      setting: true,
    }),
    [onItemsReload],
  );

  const toolBarItems: MenuProps["items"] = useMemo(
    () => [
      {
        label: (
          <span
            onClick={() => {
              toolBarItemClick(true);
            }}>
            {t("Add Filter")}
          </span>
        ),
        key: "filter",
        icon: <Icon icon="filter" />,
      },
      {
        label: (
          <span
            onClick={() => {
              toolBarItemClick(false);
            }}>
            {t("Add Sort")}
          </span>
        ),
        key: "sort",
        icon: <Icon icon="sortAscending" />,
      },
    ],
    [t, toolBarItemClick],
  );

  const toolBarRender = useCallback(() => {
    return [
      <Dropdown
        {...sharedProps}
        placement="bottom"
        trigger={["contextMenu"]}
        open={optionsOpen}
        onOpenChange={handleOptionsOpenChange}
        key="control">
        <Dropdown
          dropdownRender={() =>
            selectedFilter && (
              <DropdownRender
                filter={selectedFilter}
                close={close}
                index={filters.length - 1}
                open={conditionMenuOpen}
                isFilter={isFilter.current}
                currentView={currentView}
                setCurrentView={setCurrentView}
                onFilterChange={onFilterChange}
              />
            )
          }
          trigger={["contextMenu"]}
          placement="bottom"
          arrow={false}
          open={conditionMenuOpen}
          onOpenChange={handleConditionMenuOpenChange}>
          <Dropdown
            menu={{ items: toolBarItems }}
            placement="bottom"
            trigger={["click"]}
            arrow={false}
            open={controlMenuOpen}
            onOpenChange={handleControlMenuOpenChange}>
            <Tooltip title={t("Control")}>
              <IconWrapper>
                <Icon icon="control" size={18} />
              </IconWrapper>
            </Tooltip>
          </Dropdown>
        </Dropdown>
      </Dropdown>,
    ];
  }, [
    close,
    conditionMenuOpen,
    controlMenuOpen,
    currentView,
    filters.length,
    handleConditionMenuOpenChange,
    handleControlMenuOpenChange,
    handleOptionsOpenChange,
    onFilterChange,
    optionsOpen,
    selectedFilter,
    setCurrentView,
    sharedProps,
    t,
    toolBarItems,
  ]);

  const settingOptions = useMemo(() => {
    const cols: Record<string, ColumnsState> = {};
    currentView.columns?.forEach((col, index) => {
      if (
        col.field.type === "ID" ||
        col.field.type === "STATUS" ||
        col.field.type === "CREATION_DATE" ||
        col.field.type === "CREATION_USER" ||
        col.field.type === "MODIFICATION_DATE" ||
        col.field.type === "MODIFICATION_USER"
      ) {
        cols[col.field.type] = { show: col.visible, order: index, fixed: col.fixed };
      } else {
        cols[col.field.id ?? ""] = { show: col.visible, order: index, fixed: col.fixed };
      }
    });
    return cols;
  }, [currentView.columns]);

  const setSettingOptions = useCallback(
    (options: Record<string, ColumnsState>) => {
      const cols: Column[] = tableColumns
        .filter(
          col =>
            typeof col.key === "string" && col.key !== "EDIT_ICON" && col.key !== "commentsCount",
        )
        .map((col, index) => ({
          field: {
            type: col.fieldType as FieldType,
            id:
              col.fieldType === "FIELD" || col.fieldType === "META_FIELD"
                ? (col.key as string)
                : undefined,
          },
          visible:
            (col.key as string) in options && options[col.key as string].show !== undefined
              ? options[col.key as string].show
              : true,
          order:
            (col.key as string) in options && options[col.key as string].order !== undefined
              ? (options[col.key as string]?.order as number)
              : index + 2,
          fixed:
            (col.key as string) in options && options[col.key as string].fixed !== undefined
              ? options[col.key as string]?.fixed
              : options[col.fieldType as string]?.fixed,
        }))
        .sort((a, b) => a.order - b.order)
        .map(col => {
          return {
            field: col.field,
            visible: col.visible as boolean,
            fixed: col.fixed,
          };
        });

      setCurrentView(prev => ({
        ...prev,
        columns: cols,
      }));
    },
    [setCurrentView, tableColumns],
  );

  return (
    <>
      {contentTableColumns ? (
        <ResizableProTable
          showSorterTooltip={false}
          options={options}
          loading={loading}
          pagination={pagination}
          toolbar={handleToolbarEvents}
          toolBarRender={toolBarRender}
          dataSource={contentTableFields}
          tableAlertOptionRender={AlertOptions}
          rowSelection={rowSelection}
          columns={tableColumns}
          columnsState={{
            value: settingOptions,
            onChange: setSettingOptions,
          }}
          onChange={(pagination, _, sorter) => {
            onContentTableChange(
              pagination.current ?? 1,
              pagination.pageSize ?? 10,
              Array.isArray(sorter)
                ? undefined
                : sorter.order &&
                    sorter.column &&
                    "fieldType" in sorter.column &&
                    typeof sorter.columnKey === "string"
                  ? {
                      field: {
                        id:
                          sorter.column.fieldType === "FIELD" ||
                          sorter.column.fieldType === "META_FIELD"
                            ? sorter.columnKey
                            : undefined,
                        type: sorter.column.fieldType as FieldType,
                      },
                      direction: sorter.order === "ascend" ? "ASC" : "DESC",
                    }
                  : undefined,
            );
          }}
          heightOffset={102}
        />
      ) : null}
      {selection && (
        <LinkItemRequestModal
          itemIds={selection.selectedRowKeys}
          onChange={onAddItemToRequest}
          onLinkItemRequestModalCancel={onAddItemToRequestModalClose}
          visible={addItemToRequestModalShown}
          linkedRequest={undefined}
          requestList={requests}
          onRequestTableChange={onRequestTableChange}
          requestModalLoading={requestModalLoading}
          requestModalTotalCount={requestModalTotalCount}
          requestModalPage={requestModalPage}
          requestModalPageSize={requestModalPageSize}
          onRequestSearchTerm={onRequestSearchTerm}
          onRequestTableReload={onRequestTableReload}
        />
      )}
    </>
  );
};

export default ContentTable;

const StyledButton = styled(Button)`
  padding: 0;
`;

const PrimaryButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.a`
  color: #ff7875;
`;

const StyledBadge = styled(Badge)`
  + * {
    margin-left: 4px;
  }
`;

const StyledSearchContainer = styled.div`
  display: flex;
`;

const StyledSearchInput = styled(Input.Search)`
  min-width: 200px;
`;

const StyledFilterSpace = styled(Space)`
  max-width: 750px;
  overflow-x: auto;
  margin-top: 0;
`;

const StyledFilterButton = styled(Button)`
  color: rgba(0, 0, 0, 0.25);
`;

const StyledFilterWrapper = styled.div`
  display: flex;
  text-align: left;
  ant-space {
    flex: 1;
    align-self: start;
    justify-self: start;
    text-align: start;
  }
  .ant-pro-form-light-filter-item {
    margin: 0;
  }
`;

const IconWrapper = styled.span`
  cursor: pointer;
  &:hover {
    color: #40a9ff;
  }
`;

const InputWrapper = styled.div`
  padding: 8px 10px;
`;

const Wrapper = styled.div`
  background-color: #fff;
  box-shadow:
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

const menuStyle: React.CSSProperties = {
  boxShadow: "none",
  overflowY: "auto",
  maxHeight: "256px",
};

const stateColors: {
  [K in StateType]: ColorType;
} = {
  DRAFT: "#BFBFBF",
  PUBLIC: "#52C41A",
  REVIEW: "#FA8C16",
};
