import { useState, useEffect, ChangeEvent, useCallback, useMemo } from "react";

import { TablePaginationConfig } from "@reearth-cms/components/atoms/ProTable";
import { useIsItemReferencedLazyQuery } from "@reearth-cms/gql/graphql-client-api";

export default (
  linkItemModalTotalCount?: number,
  linkItemModalPage?: number,
  linkItemModalPageSize?: number,
  visible?: boolean,
) => {
  const [value, setValue] = useState("");

  const [checkIfItemIsReferenced, { data }] = useIsItemReferencedLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleCheckItemReference = useCallback(
    async (value: string, correspondingFieldId: string) =>
      await checkIfItemIsReferenced({ variables: { itemId: value ?? "", correspondingFieldId } }),
    [checkIfItemIsReferenced],
  );

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
    isReferenced: data?.isItemReferenced,
    value,
    toolbar,
    pagination,
    handleInput,
    handleCheckItemReference,
  };
};
