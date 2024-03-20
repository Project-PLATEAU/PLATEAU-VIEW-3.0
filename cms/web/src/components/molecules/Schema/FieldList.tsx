import styled from "@emotion/styled";
import React, { useMemo } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import List from "@reearth-cms/components/atoms/List";
import { SelectedSchemaType, Tab } from "@reearth-cms/components/molecules/Schema";
import { useT } from "@reearth-cms/i18n";

import { fieldTypes } from "./fieldTypes";
import { FieldType } from "./types";

export interface Props {
  className?: string;
  currentTab?: Tab;
  selectedSchemaType?: SelectedSchemaType;
  addField: (fieldType: FieldType) => void;
}

type FieldListItem = { title: string; fields: FieldType[] };

const FieldList: React.FC<Props> = ({ currentTab, selectedSchemaType, addField }) => {
  const t = useT();

  const group: FieldListItem[] = useMemo(
    () => [
      {
        title: t("Text"),
        fields: ["Text", "TextArea", "MarkdownText"],
      },
      {
        title: t("Asset"),
        fields: ["Asset"],
      },
      {
        title: t("Time"),
        fields: ["Date"],
      },
      {
        title: t("Boolean"),
        fields: ["Bool"],
      },
      {
        title: t("Select"),
        fields: ["Select"],
      },
      {
        title: t("Number"),
        fields: ["Integer"],
      },
      {
        title: t("URL"),
        fields: ["URL"],
      },
    ],
    [t],
  );

  const data: FieldListItem[] = useMemo(
    () => [
      ...group,
      {
        title: t("Relation"),
        fields: ["Reference"],
      },
      {
        title: t("Group"),
        fields: ["Group"],
      },
    ],
    [group, t],
  );

  const meta: FieldListItem[] = useMemo(
    () => [
      {
        title: t("Meta Data"),
        fields: ["Tag", "Bool", "Checkbox", "Date", "Text", "URL"],
      },
    ],
    [t],
  );

  const dataSource = useMemo(
    () => (selectedSchemaType === "group" ? group : currentTab === "meta-data" ? meta : data),
    [selectedSchemaType, group, currentTab, meta, data],
  );

  return (
    <>
      <h1>{t("Add Field")}</h1>
      <FieldStyledList
        itemLayout="horizontal"
        dataSource={dataSource}
        renderItem={item => (
          <>
            <FieldCategoryTitle>{(item as FieldListItem).title}</FieldCategoryTitle>
            {(item as FieldListItem).fields?.map(field => (
              <List.Item key={field} onClick={() => addField(field as FieldType)}>
                <Meta
                  avatar={<Icon icon={fieldTypes[field].icon} color={fieldTypes[field].color} />}
                  title={t(fieldTypes[field].title)}
                  description={t(fieldTypes[field].description)}
                />
              </List.Item>
            ))}
          </>
        )}
      />
    </>
  );
};

const FieldCategoryTitle = styled.h2`
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  margin-bottom: 12px;
  margin-top: 12px;
  color: rgba(0, 0, 0, 0.45);
`;

const FieldStyledList = styled(List)`
  max-height: calc(100% - 34px);
  overflow-y: auto;
  padding-bottom: 24px;
  .ant-list-item {
    background-color: #fff;
    cursor: pointer;
    + .ant-list-item {
      margin-top: 12px;
    }
    padding: 4px;
    box-shadow: 0px 2px 8px #00000026;
    .ant-list-item-meta {
      .ant-list-item-meta-title {
        margin: 0;
      }
      align-items: center;
      .ant-list-item-meta-avatar {
        border: 1px solid #f0f0f0;
        width: 28px;
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
`;

const Meta = styled(List.Item.Meta)`
  .ant-list-item-meta-description {
    font-size: 12px;
  }
`;

export default FieldList;
