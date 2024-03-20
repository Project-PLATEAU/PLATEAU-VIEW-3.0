import styled from "@emotion/styled";
import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import Tag from "@reearth-cms/components/atoms/Tag";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  selectedTags?: { id: string; name: string; color: string }[];
  multiple?: boolean;
}

const TagField: React.FC<Props> = ({ selectedTags, multiple }) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      {multiple ? (
        <StyledMultipleSelect key={selectedTags?.length} mode="multiple" showArrow>
          {selectedTags?.map(tag => (
            <Select.Option key={tag.name} value={tag.name}>
              <Tag color={tag.color.toLowerCase()}>{tag.name}</Tag>
            </Select.Option>
          ))}
        </StyledMultipleSelect>
      ) : (
        <Select key={selectedTags?.length} showArrow allowClear>
          {selectedTags?.map(tag => (
            <Select.Option key={tag.name} value={tag.name}>
              <Tag color={tag.color.toLowerCase()}>{tag.name}</Tag>
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
};

const StyledMultipleSelect = styled(Select)`
  .ant-select-selection-overflow-item {
    margin-right: 4px;
  }
  .ant-select-selection-item {
    padding: 0;
    margin-right: 0;
    border: 0;
  }
  .ant-select-selection-item-content {
    margin-right: 0;
  }
  .ant-select-selection-item-remove {
    display: none;
  }
  .ant-tag {
    margin-right: 0;
  }
`;

export default TagField;
