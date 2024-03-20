import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Radio from "@reearth-cms/components/atoms/Radio";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import Steps from "@reearth-cms/components/atoms/Step";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import FieldValidationProps from "@reearth-cms/components/molecules/Schema/FieldModal/FieldValidationInputs";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import {
  Field,
  FieldModalTabs,
  FieldType,
  FormValues,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

const { Step } = Steps;

export type Props = {
  selectedField?: Field | null;
  open?: boolean;
  selectedType: FieldType;
  models?: Model[];
  handleFieldKeyUnique: (key: string, fieldId?: string) => boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
  onUpdate?: (values: FormValues) => Promise<void> | void;
};

const FieldCreationModalWithSteps: React.FC<Props> = ({
  selectedField,
  open,
  models,
  selectedType,
  handleFieldKeyUnique,
  onClose,
  onSubmit,
  onUpdate,
}) => {
  const t = useT();
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const schemaIdRef = useRef<string>();
  const [modelForm] = Form.useForm();
  const [field1Form] = Form.useForm();
  const [field2Form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [numSteps, setNumSteps] = useState(1);
  const { TabPane } = Tabs;
  const [activeTab, setActiveTab] = useState<FieldModalTabs>("settings");

  useEffect(() => {
    modelForm.setFieldsValue({
      model: selectedField?.typeProperty?.modelId,
      direction: selectedField?.typeProperty?.correspondingField ? 2 : 1,
    });

    setSelectedModel(selectedField?.typeProperty?.modelId);
    setNumSteps(selectedField?.typeProperty?.correspondingField ? 2 : 1);
    field1Form.setFieldsValue({
      ...selectedField,
    });
    if (selectedField?.typeProperty?.correspondingField) {
      field2Form.setFieldsValue({
        ...selectedField.typeProperty.correspondingField,
      });
    }
  }, [modelForm, selectedField, field1Form, field2Form, setNumSteps, setSelectedModel]);

  const initialValues: FormValues = useMemo(
    () => ({
      title: "",
      description: "",
      key: "",
      multiple: false,
      unique: false,
      required: false,
      isTitle: false,
      metadata: false,
      type: "Text",
      typeProperty: {
        reference: {
          modelId: "",
          schemaId: "",
          correspondingField: null,
        },
      },
    }),
    [],
  );

  const isTwoWayReference = useMemo(() => numSteps === 2, [numSteps]);
  const isUpdate = useMemo(() => !!selectedField, [selectedField]);

  const [field1FormValues, setField1FormValues] = useState(initialValues);

  const handleTabChange = useCallback(
    (key: string) => {
      setActiveTab(key as FieldModalTabs);
    },
    [setActiveTab],
  );

  const handleSelectModel = useCallback(
    (modelId: string, option: { schemaId: string }) => {
      setSelectedModel(modelId);
      schemaIdRef.current = option.schemaId;
    },
    [setSelectedModel],
  );

  const clearFormFields = useCallback(() => {
    modelForm.resetFields();
    field1Form.resetFields();
    field2Form.resetFields();
    setCurrentStep(0);
    setField1FormValues(initialValues);
  }, [modelForm, field1Form, field2Form, initialValues, setCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    setActiveTab("settings");
  }, [currentStep]);

  const nextStep = useCallback(() => {
    setCurrentStep(currentStep + 1);
    setActiveTab("settings");
  }, [currentStep]);

  const handleFirstField = useCallback(async () => {
    field1Form
      .validateFields()
      .then(async values => {
        values.type = "Reference";
        values.typeProperty = {
          reference: {
            modelId: selectedModel,
            schemaId: schemaIdRef.current,
            correspondingField: null,
          },
        };
        setField1FormValues(values);
        if (currentStep < numSteps) {
          nextStep();
        } else {
          if (selectedField) {
            await onUpdate?.({ ...values, fieldId: selectedField.id });
          } else {
            await onSubmit?.(values);
          }
        }
      })
      .catch(_ => {
        setActiveTab("settings");
      });
  }, [
    field1Form,
    selectedModel,
    currentStep,
    numSteps,
    nextStep,
    selectedField,
    onUpdate,
    onSubmit,
  ]);

  const handleSecondField = useCallback(() => {
    if (selectedField) {
      field2Form
        .validateFields()
        .then(async fields2Values => {
          field1FormValues.typeProperty = {
            reference: {
              modelId: selectedModel ?? "",
              schemaId: schemaIdRef.current ?? "",
              correspondingField: {
                ...fields2Values,
                fieldId: selectedField?.typeProperty?.correspondingField.id,
              },
            },
          };
          await onUpdate?.({ ...field1FormValues, fieldId: selectedField.id });
          onClose?.(true);
        })
        .catch(_ => {
          setActiveTab("settings");
        });
    } else {
      field2Form
        .validateFields()
        .then(async fields2Values => {
          field1FormValues.typeProperty = {
            reference: {
              modelId: selectedModel ?? "",
              schemaId: schemaIdRef.current ?? "",
              correspondingField: {
                ...fields2Values,
              },
            },
          };

          await onSubmit?.(field1FormValues);
          onClose?.(true);
        })
        .catch(_ => {
          setActiveTab("settings");
        });
    }
  }, [onClose, onSubmit, onUpdate, selectedField, field1FormValues, field2Form, selectedModel]);

  return (
    <StyledModal
      title={
        selectedType ? (
          <FieldThumbnail>
            <StyledIcon
              icon={fieldTypes[selectedType].icon}
              color={fieldTypes[selectedType].color}
            />
            <h3>
              <span>{selectedField ? t("Update") : t("Create")} </span>
              <span>
                {t(fieldTypes[selectedType].title)} {t("Field")}
              </span>
            </h3>
          </FieldThumbnail>
        ) : null
      }
      onCancel={() => {
        onClose?.(true);
        clearFormFields();
      }}
      afterClose={() => {
        clearFormFields();
      }}
      width={700}
      open={open}
      footer={
        <>
          {currentStep === 2 ? (
            <Button key="previous" type="default" onClick={prevStep}>
              {t("Previous")}
            </Button>
          ) : (
            <div key="placeholder" />
          )}
          {currentStep === 0 && (
            <Button key="next" type="primary" onClick={nextStep}>
              {t("Next")}
            </Button>
          )}
          {currentStep === 1 && (
            <Button key="next" type="primary" onClick={handleFirstField}>
              {currentStep !== numSteps ? t("Next") : t("Confirm")}
            </Button>
          )}
          {currentStep === 2 && (
            <Button key="submit" type="primary" onClick={handleSecondField}>
              {t("Confirm")}
            </Button>
          )}
        </>
      }>
      <Steps progressDot current={currentStep}>
        <StyledStep title={t("Reference setting")} />
        <StyledStep title={t("Field")} />
        {numSteps === 2 && <StyledStep title={t("Corresponding field")} />}
      </Steps>
      {currentStep === 0 && (
        <Form form={modelForm}>
          <StyledFormItem
            name="model"
            label={t("Select the model to reference")}
            rules={[{ required: true, message: t("Please select the model!") }]}>
            <Select value={selectedModel} onSelect={handleSelectModel} disabled={isUpdate}>
              {models?.map(model => (
                <Select.Option key={model.id} value={model.id} schemaId={model.schema.id}>
                  {model.name}{" "}
                  <StyledModelKey className="ant-form-item-extra">#{model.key}</StyledModelKey>
                </Select.Option>
              ))}
            </Select>
          </StyledFormItem>
          <StyledFormItem name="direction" label={t("Reference direction")}>
            <Radio.Group onChange={e => setNumSteps(e.target.value)} value={numSteps}>
              <Space direction="vertical" size={0}>
                <Radio value={1} disabled={isUpdate}>
                  {t("One-way reference")}
                </Radio>
                <div className="ant-form-item-extra">
                  {t("A unidirectional relationship where an item refers to another item")}
                </div>
                <Radio value={2} disabled={isUpdate}>
                  {t("Two-way reference")}
                </Radio>
                <div className="ant-form-item-extra">
                  {t("A bidirectional relationship where two items refer to each other")}
                </div>
              </Space>
            </Radio.Group>
          </StyledFormItem>
        </Form>
      )}
      {currentStep === 1 && (
        <Form form={field1Form} layout="vertical" initialValues={initialValues}>
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
                label="Field Key"
                extra={t(
                  "Field key must be unique and at least 1 character long. It can only contain letters, numbers, underscores and dashes.",
                )}
                rules={[
                  {
                    message: t("Key is not valid"),
                    required: true,
                    validator: async (_, value) => {
                      if (!validateKey(value)) return Promise.reject();
                      const isKeyAvailable = handleFieldKeyUnique(
                        value,
                        selectedField ? selectedField?.id : undefined,
                      );
                      if (isKeyAvailable) {
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
              <Form.Item
                name="multiple"
                valuePropName="checked"
                extra={t("Stores a list of values instead of a single value")}>
                <Checkbox disabled>{t("Support multiple values")}</Checkbox>
              </Form.Item>
              <Form.Item
                hidden
                name="isTitle"
                valuePropName="checked"
                extra={t("Only one field can be used as the title")}>
                <Checkbox>{t("Use as title")}</Checkbox>
              </Form.Item>
            </TabPane>
            <TabPane tab="Validation" key="validation" forceRender>
              <FieldValidationProps selectedType={selectedType} />
              <Form.Item
                name="required"
                valuePropName="checked"
                extra={t("Prevents saving an entry if this field is empty")}>
                <Checkbox>{t("Make field required")}</Checkbox>
              </Form.Item>
              <Form.Item
                name="unique"
                valuePropName="checked"
                extra={t(
                  "Ensures that a multiple entries can't have the same value for this field",
                )}>
                <Checkbox disabled={isTwoWayReference}>{t("Set field as unique")}</Checkbox>
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      )}
      {currentStep === 2 && (
        <Form form={field2Form} layout="vertical" initialValues={initialValues}>
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
                label="Field Key"
                extra={t(
                  "Field key must be unique and at least 1 character long. It can only contain letters, numbers, underscores and dashes.",
                )}
                rules={[
                  {
                    message: t("Key is not valid"),
                    required: true,
                    validator: async (_, value) => {
                      if (!validateKey(value)) return Promise.reject();
                      const isKeyAvailable = handleFieldKeyUnique(value);
                      if (isKeyAvailable) {
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
            </TabPane>
            <TabPane tab="Validation" key="validation" forceRender>
              <FieldValidationProps selectedType={selectedType} />
              <Form.Item
                name="required"
                valuePropName="checked"
                extra={t("Prevents saving an entry if this field is empty")}>
                <Checkbox>{t("Make field required")}</Checkbox>
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      )}
    </StyledModal>
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

const StyledFormItem = styled(Form.Item)`
  .ant-row.ant-form-item-row {
    display: block;
  }
`;

const StyledStep = styled(Step)`
  .ant-steps-item-title {
    white-space: nowrap;
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-footer {
    display: flex;
    justify-content: space-between;
  }
`;

const StyledModelKey = styled.span`
  font-size: 12px;
  margin-left: 4px;
`;

export default FieldCreationModalWithSteps;
