import Icon from "@reearth-cms/components/atoms/Icon";
import Space from "@reearth-cms/components/atoms/Space";
import { Field } from "@reearth-cms/components/molecules/Schema/types";

export const renderTitle = (field: Field) => {
  return (
    <Space size={4}>
      {field.title}
      <Icon icon="edit" />
    </Space>
  );
};
