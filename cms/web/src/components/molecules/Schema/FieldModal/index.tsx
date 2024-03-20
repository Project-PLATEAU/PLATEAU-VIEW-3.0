import styled from "@emotion/styled";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form, { FieldError } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import MultiValueColoredTag from "@reearth-cms/components/molecules/Common/MultiValueField/MultValueColoredTag";
import FieldDefaultInputs from "@reearth-cms/components/molecules/Schema/FieldModal/FieldDefaultInputs";
import FieldValidationInputs from "@reearth-cms/components/molecules/Schema/FieldModal/FieldValidationInputs";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import {
  Field,
  FieldType,
  Group,
  FormValues,
} from "@reearth-cms/components/molecules/Schema/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

import useHooks from "./hooks";

export type Props = {
  groups?: Group[];
  open?: boolean;
  isMeta: boolean;
  fieldLoading: boolean;
  selectedType: FieldType;
  selectedField?: Field | null;
  handleFieldKeyUnique: (key: string, fieldId?: string) => boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType: UploadType;
  totalCount: number;
  page: number;
  pageSize: number;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
};

const initialValues: FormValues = {
  fieldId: "",
  title: "",
  description: "",
  key: "",
  metadata: false,
  multiple: false,
  unique: false,
  isTitle: false,
  required: false,
  type: "Text",
  typeProperty: { text: { defaultValue: "", maxLength: 0 } },
};

const { TabPane } = Tabs;

const FieldModal: React.FC<Props> = ({
  groups,
  open,
  isMeta,
  fieldLoading,
  selectedType,
  selectedField,
  onClose,
  onSubmit,
  handleFieldKeyUnique,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  totalCount,
  page,
  pageSize,
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetSearchTerm,
  onAssetsGet,
  onAssetsReload,
  setFileList,
  setUploadModalVisibility,
  onGetAsset,
}) => {
  const t = useT();

  const {
    form,
    buttonDisabled,
    setButtonDisabled,
    activeTab,
    selectedValues,
    selectedTags,
    multipleValue,
    handleMultipleChange,
    handleTabChange,
    handleSubmit,
    handleModalReset,
    handleModalCancel,
    isRequiredDisabled,
    isUniqueDisabled,
  } = useHooks(selectedType, isMeta, selectedField, onClose, onSubmit);

  return (
    <Modal
      title={
        <FieldThumbnail>
          <StyledIcon icon={fieldTypes[selectedType].icon} color={fieldTypes[selectedType].color} />
          <h3>
            {selectedField ? t("Update") : t("Create")} {t(fieldTypes[selectedType].title)}
          </h3>
        </FieldThumbnail>
      }
      open={open}
      onCancel={handleModalCancel}
      onOk={handleSubmit}
      confirmLoading={fieldLoading}
      okButtonProps={{ disabled: buttonDisabled }}
      afterClose={handleModalReset}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={() => {
          setTimeout(() => {
            form
              .validateFields()
              .then(() => {
                setButtonDisabled(false);
              })
              .catch(fieldsError => {
                setButtonDisabled(
                  fieldsError.errorFields.some((item: FieldError) => item.errors.length > 0),
                );
              });
          });
        }}>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab={t("Settings")} key="settings" forceRender>
            <Form.Item
              name="title"
              label={t("Display name")}
              rules={[{ required: true, message: t("Please input the display name of field!") }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="key"
              label={t("Field Key")}
              extra={t(
                "Field key must be unique and at least 1 character long. It can only contain letters, numbers, underscores and dashes.",
              )}
              rules={[
                {
                  message: t("Key is not valid"),
                  required: true,
                  validator: async (_, value) => {
                    if (validateKey(value) && handleFieldKeyUnique(value, selectedField?.id)) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject();
                    }
                  },
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item requiredMark="optional" name="description" label={t("Description")}>
              <TextArea rows={3} showCount maxLength={1000} />
            </Form.Item>
            {selectedType === "Select" && (
              <Form.Item
                name="values"
                label={t("Set Options")}
                rules={[
                  {
                    validator: async (_, values) => {
                      if (!values || values.length < 1) {
                        return Promise.reject(new Error("At least 1 option"));
                      }
                      if (values.some((value: string) => value.length === 0)) {
                        return Promise.reject(new Error("Empty values are not allowed"));
                      }
                    },
                  },
                ]}>
                <MultiValueField FieldInput={Input} />
              </Form.Item>
            )}
            {selectedType === "Tag" && (
              <Form.Item
                name="tags"
                label={t("Set Tags")}
                rules={[
                  {
                    validator: async (_, values) => {
                      if (!values || values.length < 1) {
                        return Promise.reject(new Error("At least 1 option"));
                      }
                      if (values.some((value: string) => value.length === 0)) {
                        return Promise.reject(new Error("Empty values are not allowed"));
                      }
                      const uniqueNames = new Set(values.map((valueObj: any) => valueObj.name));
                      if (uniqueNames.size !== values.length) {
                        return Promise.reject(new Error("Labels must be unique"));
                      }
                    },
                  },
                ]}>
                <MultiValueColoredTag />
              </Form.Item>
            )}
            {selectedType === "Group" && (
              <Form.Item
                name="group"
                label={t("Select Group")}
                rules={[{ required: true, message: t("Please select the group!") }]}>
                <Select>
                  {groups?.map(group => (
                    <Select.Option key={group.id} value={group.id}>
                      {group.name}{" "}
                      <StyledGroupKey className="ant-form-item-extra">#{group.key}</StyledGroupKey>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Form.Item
              name="multiple"
              valuePropName="checked"
              extra={t("Stores a list of values instead of a single value")}>
              <Checkbox onChange={(e: CheckboxChangeEvent) => handleMultipleChange(e)}>
                {t("Support multiple values")}
              </Checkbox>
            </Form.Item>
            <Form.Item
              name="isTitle"
              hidden={isMeta || selectedType === "Group"}
              valuePropName="checked"
              extra={t("Only one field can be used as the title")}>
              <Checkbox>{t("Use as title")}</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane tab={t("Validation")} key="validation" forceRender>
            <FieldValidationInputs selectedType={selectedType} />
            <Form.Item
              name="required"
              valuePropName="checked"
              extra={t("Prevents saving an entry if this field is empty")}>
              <Checkbox disabled={isRequiredDisabled}>{t("Make field required")}</Checkbox>
            </Form.Item>
            <Form.Item
              name="unique"
              valuePropName="checked"
              extra={t("Ensures that multiple entries can't have the same value for this field")}>
              <Checkbox disabled={isUniqueDisabled}>{t("Set field as unique")}</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane tab={t("Default value")} key="defaultValue" forceRender>
            <FieldDefaultInputs
              multiple={multipleValue}
              selectedValues={selectedValues}
              selectedTags={selectedTags}
              selectedType={selectedType}
              assetList={assetList}
              fileList={fileList}
              loadingAssets={loadingAssets}
              uploading={uploading}
              uploadModalVisibility={uploadModalVisibility}
              uploadUrl={uploadUrl}
              uploadType={uploadType}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
              onAssetTableChange={onAssetTableChange}
              onUploadModalCancel={onUploadModalCancel}
              setUploadUrl={setUploadUrl}
              setUploadType={setUploadType}
              onAssetsCreate={onAssetsCreate}
              onAssetCreateFromUrl={onAssetCreateFromUrl}
              onAssetSearchTerm={onAssetSearchTerm}
              onAssetsGet={onAssetsGet}
              onAssetsReload={onAssetsReload}
              setFileList={setFileList}
              setUploadModalVisibility={setUploadModalVisibility}
              onGetAsset={onGetAsset}
            />
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

const FieldThumbnail = styled.div`
  display: flex;
  align-items: center;
  h3 {
    margin: 0;
    margin-left: 12px;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #000000d9;
  }
`;

const StyledIcon = styled(Icon)`
  border: 1px solid #f0f0f0;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  span {
    display: inherit;
  }
`;

const StyledGroupKey = styled.span`
  font-size: 12px;
  margin-left: 4px;
`;

export default FieldModal;
