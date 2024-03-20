import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Popover from "@reearth-cms/components/atoms/Popover";
import Select from "@reearth-cms/components/atoms/Select";
import Tag from "@reearth-cms/components/atoms/Tag";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import ItemFormat from "./ItemFormat";

export const renderField = (
  el: { props: { children: string | string[] } },
  field: Field,
  update?: (value?: string | string[] | boolean, index?: number) => void,
) => {
  const value = el.props.children;
  const items = Array.isArray(value) ? value : [value];

  if ((field.type === "Bool" || field.type === "Checkbox") && !field.multiple) {
    return <ItemFormat item={items[0]} field={field} update={update} />;
  } else if (field.type === "Tag") {
    const tags = field.typeProperty?.tags;
    const filteredTags = tags?.filter(tag => value.includes(tag.id)) || [];
    return (
      <StyledSelect
        mode={field.multiple ? "multiple" : undefined}
        defaultValue={filteredTags.map(({ name }) => name)}
        tagRender={props => {
          return <>{props.label}</>;
        }}
        showArrow={false}
        allowClear={field.multiple ? false : true}
        onChange={(_, option) => {
          const value: string | string[] | undefined = Array.isArray(option)
            ? option.map(({ key }) => key)
            : option?.key;
          update?.(value);
        }}
        placeholder="-">
        {tags?.map(({ id, name, color }) => (
          <Select.Option key={id} value={name}>
            <Tag color={color.toLowerCase()}>{name}</Tag>
          </Select.Option>
        ))}
      </StyledSelect>
    );
  } else if (value === "-") {
    if (
      (field.type === "Text" || field.type === "Date" || field.type === "URL") &&
      !field.multiple &&
      update
    ) {
      return <ItemFormat item="" field={field} update={update} />;
    }
    return <span>-</span>;
  } else if (field.type === "Select") {
    return (
      <>
        {items.map((item, index) => (
          <Tag key={index}>{item}</Tag>
        ))}
      </>
    );
  } else if (items.length > 1 || field.type === "TextArea" || field.type === "MarkdownText") {
    const content = (
      <>
        {items.map((item, index) => {
          return (
            <Content key={index}>
              <ItemFormat item={item} field={field} update={update} index={index} />
            </Content>
          );
        })}
      </>
    );
    return (
      <Popover content={content} title={field.title} trigger="click" placement="bottom">
        <StyledButton>
          <Icon icon={fieldTypes[field.type].icon} size={16} />
          {items.length > 1 && <span>x{items.length}</span>}
        </StyledButton>
      </Popover>
    );
  } else {
    return <ItemFormat item={items[0]} field={field} update={update} />;
  }
};

const StyledButton = styled(Button)`
  align-items: center;
  border-color: #00000008;
  color: #1890ff;
  display: flex;
  font-size: 12px;
  gap: 8px;
  padding: 4px;
`;

const Content = styled.p`
  margin: 0;
  padding: 4px 8px 20px;
  :last-child {
    padding-bottom: 0;
  }
`;

const StyledSelect = styled(Select)`
  width: 100%;
  && .ant-select-selector {
    border-color: transparent;
    cursor: pointer !important;
  }
  .ant-select-selection-overflow {
    flex-wrap: nowrap;
    overflow-x: hidden;
  }
  .ant-select-selection-placeholder {
    color: inherit;
  }
`;
