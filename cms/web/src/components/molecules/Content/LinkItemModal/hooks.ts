import { useState, useEffect, ChangeEvent, useCallback, useMemo } from "react";

import { TablePaginationConfig } from "@reearth-cms/components/atoms/ProTable";

export default (
  linkItemModalTotalCount?: number,
  linkItemModalPage?: number,
  linkItemModalPageSize?: number,
  visible?: boolean,
) => {
  const [value, setValue] = useState("");

  const pagination: TablePaginationConfig = useMemo(
    () => ({
      showSizeChanger: true,
      current: linkItemModalPage,
      total: linkItemModalTotalCount,
      pageSize: linkItemModalPageSize,
    }),
    [linkItemModalPage, linkItemModalTotalCount, linkItemModalPageSize],
  );

  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  useEffect(() => {
    if (!visible) {
      setValue("");
    }
  }, [visible]);

  return {
    value,
    pagination,
    handleInput,
  };
};
