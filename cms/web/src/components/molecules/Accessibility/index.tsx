import styled from "@emotion/styled";
import React, { useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Input from "@reearth-cms/components/atoms/Input";
import Select from "@reearth-cms/components/atoms/Select";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { PublicScope } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

type ModelDataType = {
  id: string;
  name: string;
  public: JSX.Element;
  publicState: boolean;
  key?: string;
};

type Props = {
  models?: Model[];
  scope?: PublicScope;
  alias?: string;
  aliasState?: string;
  assetState?: boolean;
  isSaveDisabled: boolean;
  handlePublicUpdate: () => void;
  handleAliasChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpdatedAssetState: (state: boolean) => void;
  handleUpdatedModels: (model: Model) => void;
  handleSetScope?: (projectScope: PublicScope) => void;
};

const Accessibility: React.FC<Props> = ({
  models,
  scope,
  alias,
  aliasState,
  assetState,
  isSaveDisabled,
  handlePublicUpdate,
  handleAliasChange,
  handleUpdatedAssetState,
  handleUpdatedModels,
  handleSetScope,
}) => {
  const t = useT();
  const [form] = Form.useForm();

  const columns: TableColumnsType<ModelDataType> = [
    {
      title: t("Model"),
      dataIndex: "name",
      key: "name",
      width: 220,
    },
    {
      title: t("Switch"),
      dataIndex: "public",
      key: "public",
      align: "center",
      width: 90,
    },
    {
      title: t("End point"),
      dataIndex: "endpoint",
      key: "endpoint",
      render: (_, modelData: ModelDataType) => {
        return (
          modelData.publicState &&
          modelData.key && (
            <StyledAnchor
              target="_blank"
              href={window.REEARTH_CONFIG?.api + "/p/" + alias + "/" + modelData.key}
              rel="noreferrer">
              {window.REEARTH_CONFIG?.api}/p/{alias}/{modelData.key}
            </StyledAnchor>
          )
        );
      },
    },
  ];

  const dataSource: ModelDataType[] = useMemo(() => {
    let columns: ModelDataType[] = [
      {
        id: "assets",
        name: t("Assets"),
        key: "assets",
        publicState: assetState ?? false,
        public: (
          <Switch
            checked={assetState}
            onChange={(publicState: boolean) => handleUpdatedAssetState(publicState)}
          />
        ),
      },
    ];

    if (models) {
      columns = [
        ...models.map(m => {
          return {
            id: m.id,
            name: m.name ?? "",
            key: m.key,
            publicState: m.public,
            public: (
              <Switch
                checked={m.public}
                onChange={(publicState: boolean) =>
                  handleUpdatedModels({ ...m, public: publicState })
                }
              />
            ),
          };
        }),
        ...columns,
      ];
    }
    return columns;
  }, [models, assetState, handleUpdatedAssetState, handleUpdatedModels, t]);

  const publicScopeList = [
    { id: 1, name: t("Private"), value: "private" },
    { id: 2, name: t("Public"), value: "public" },
  ];

  return (
    <InnerContent title={t("Accessibility")} flexChildren>
      <ContentSection title="">
        <Form form={form} layout="vertical" autoComplete="off">
          <ItemsWrapper>
            <Form.Item
              label={t("Public Scope")}
              extra={t(
                "Choose the scope of your project. This affects all the models shown below that are switched on.",
              )}>
              <Select value={scope} onChange={handleSetScope}>
                {publicScopeList.map(type => (
                  <Select.Option key={type.id} value={type.value}>
                    {type.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={t("Project Alias")}>
              <Input value={aliasState} onChange={handleAliasChange} />
            </Form.Item>
          </ItemsWrapper>
          <TableWrapper>
            <Table dataSource={dataSource} columns={columns} pagination={false} />
          </TableWrapper>
          <Button type="primary" disabled={isSaveDisabled} onClick={handlePublicUpdate}>
            {t("Save changes")}
          </Button>
        </Form>
      </ContentSection>
    </InnerContent>
  );
};

export default Accessibility;

const ItemsWrapper = styled.div`
  max-width: 304px;
`;

const TableWrapper = styled.div`
  margin: 24px 0;
`;

const StyledAnchor = styled.a`
  text-decoration: underline;
  color: #000000d9;
`;
