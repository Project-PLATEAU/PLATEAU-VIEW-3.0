import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useState } from "react";

import ProTable, {
  ProColumns,
  ProTableProps,
  ParamsType,
} from "@reearth-cms/components/atoms/ProTable";
import { ResizableTitle } from "@reearth-cms/components/molecules/Common/ResizableProTable/resizable";
import type { ResizeCallbackData } from "@reearth-cms/components/molecules/Common/ResizableProTable/resizable";

type Props = ProTableProps<Record<string, any> | any, ParamsType, "text"> & {
  heightOffset: number;
};

const ResizableProTable: React.FC<Props> = ({
  dataSource,
  columns,
  loading,
  options,
  toolbar,
  toolBarRender,
  rowSelection,
  tableAlertOptionRender,
  pagination,
  onChange,
  columnsState,
  showSorterTooltip,
  heightOffset,
}) => {
  const [resizableColumns, setResizableColumns] = useState<ProColumns<any, "text">[]>(
    columns ?? [],
  );

  useEffect(() => {
    if (columns) {
      setResizableColumns(columns);
    }
  }, [columns, setResizableColumns]);

  const handleResize = useCallback(
    (index: number) =>
      (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
        const newColumns = [...resizableColumns];
        newColumns[index] = {
          ...newColumns[index],
          width: size.width,
        };
        setResizableColumns(newColumns);
      },
    [resizableColumns],
  );

  const mergeColumns: ProColumns<any, "text">[] = useMemo(
    () =>
      resizableColumns?.map((col, index): any => ({
        ...col,
        onHeaderCell: (column: ProColumns<any, "text">) => ({
          minWidth: (column as ProColumns<any, "text"> & { minWidth: number }).minWidth,
          width: (column as ProColumns<any, "text">).width,
          onResize: handleResize(index),
        }),
      })),
    [handleResize, resizableColumns],
  );

  const nthOfType = useMemo(() => {
    return columnsState?.value
      ? Object.values(columnsState?.value).some(option => option.fixed === "left")
        ? 2
        : 1
      : 0;
  }, [columnsState?.value]);

  const [isRowSelected, setIsRowSelected] = useState(false);

  useEffect(() => {
    if (typeof rowSelection !== "boolean") {
      if (rowSelection?.selectedRowKeys?.length) {
        setIsRowSelected(true);
      } else {
        setIsRowSelected(false);
      }
    }
  }, [rowSelection]);

  return (
    <StyledProTable
      nthOfType={nthOfType}
      dataSource={dataSource}
      columns={mergeColumns}
      components={{
        header: {
          cell: ResizableTitle,
        },
      }}
      rowKey="id"
      search={false}
      loading={loading}
      toolbar={toolbar}
      toolBarRender={toolBarRender}
      options={options}
      tableAlertOptionRender={tableAlertOptionRender}
      rowSelection={rowSelection}
      isRowSelected={isRowSelected}
      pagination={pagination}
      onChange={onChange}
      columnsState={columnsState}
      showSorterTooltip={showSorterTooltip}
      scroll={{ x: "", y: "" }}
      heightOffset={heightOffset}
    />
  );
};

export default ResizableProTable;

const StyledProTable = styled(ProTable)<{
  nthOfType: number;
  isRowSelected: boolean;
  heightOffset: number;
}>`
  height: ${({ heightOffset }) => `calc(100% - ${heightOffset}px)`};
  .ant-pro-card-body {
    padding-bottom: 0;
  }
  .ant-pro-card,
  .ant-pro-card-body,
  .ant-spin-nested-loading,
  .ant-spin-container,
  .ant-table-container {
    height: 100%;
  }
  .ant-table-wrapper {
    height: ${({ isRowSelected }) => `calc(100% - ${isRowSelected ? 128 : 64}px)`};
  }
  .ant-table {
    height: calc(100% - 64px);
  }
  .ant-table-small,
  .ant-table-middle {
    height: calc(100% - 56px);
  }
  .ant-table-body {
    overflow: auto !important;
    height: calc(100% - 47px);
  }
  .ant-pro-table-column-setting-overlay {
    .ant-tree-block-node:only-of-type {
      .ant-tree-treenode:nth-of-type(-n + 2) {
        display: none;
      }
    }
  }
  .ant-pro-table-column-setting-overlay {
    .ant-tree-block-node:nth-of-type(${({ nthOfType }) => nthOfType}) {
      .ant-tree-treenode:nth-of-type(-n + 2) {
        display: none;
      }
    }
  }
`;
