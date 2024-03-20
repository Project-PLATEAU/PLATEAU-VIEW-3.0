import { CheckboxChangeEvent } from "antd/lib/checkbox";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import {
  Field,
  FieldModalTabs,
  FieldType,
  FormValues,
  FormTypes,
} from "@reearth-cms/components/molecules/Schema/types";
import { transformMomentToString } from "@reearth-cms/utils/format";

export default (
  selectedType: FieldType,
  isMeta: boolean,
  selectedField?: Field | null,
  onClose?: (refetch?: boolean) => void,
  onSubmit?: (values: FormValues) => Promise<void> | void,
) => {
  const [form] = Form.useForm<FormTypes>();
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [activeTab, setActiveTab] = useState<FieldModalTabs>("settings");
  const selectedValues: string[] = Form.useWatch("values", form);
  const selectedTags = Form.useWatch("tags", form);
  const [multipleValue, setMultipleValue] = useState(false);

  const handleMultipleChange = useCallback(
    (e: CheckboxChangeEvent) => {
      const defaultValue = form.getFieldValue("defaultValue");
      if (e.target.checked) {
        form.setFieldValue("defaultValue", defaultValue && [defaultValue]);
      } else {
        form.setFieldValue("defaultValue", defaultValue?.[0]);
      }
      setMultipleValue(e.target.checked);
    },
    [form],
  );

  const handleTabChange = useCallback(
    (key: string) => {
      setActiveTab(key as FieldModalTabs);
    },
    [setActiveTab],
  );

  useEffect(() => {
    if (selectedType === "Select") {
      const defaultValue = form.getFieldValue("defaultValue");
      if (Array.isArray(defaultValue)) {
        const filteredVelue = defaultValue.filter(value => selectedValues?.includes(value));
        form.setFieldValue("defaultValue", filteredVelue);
      } else if (!selectedValues?.includes(defaultValue)) {
        form.setFieldValue("defaultValue", undefined);
      }
    }
  }, [form, selectedValues, selectedType]);

  useEffect(() => {
    if (selectedType === "Tag") {
      const defaultValue = form.getFieldValue("defaultValue");
      if (Array.isArray(defaultValue)) {
        const filteredVelue = defaultValue.filter(
          value => selectedTags?.some(tag => tag.name === value),
        );
        form.setFieldValue("defaultValue", filteredVelue);
      } else if (!selectedTags?.some(tag => tag.name === defaultValue)) {
        form.setFieldValue("defaultValue", undefined);
      }
    }
  }, [form, selectedTags, selectedType]);

  const defaultValueGet = useCallback((selectedField: Field) => {
    const defaultValue = selectedField.typeProperty?.defaultValue;
    const selectDefaultValue = selectedField.typeProperty?.selectDefaultValue;
    if (selectedField.type === "Date") {
      if (Array.isArray(defaultValue)) {
        return defaultValue.map(valueItem => moment(valueItem as string));
      } else {
        return defaultValue && moment(defaultValue as string);
      }
    } else if (selectedField.type === "Tag") {
      if (Array.isArray(selectDefaultValue)) {
        return selectDefaultValue.map(
          valueItem =>
            selectedField.typeProperty?.tags?.find(
              (tag: { id: string; name: string }) => tag.id === valueItem,
            )?.name,
        );
      } else {
        return selectedField.typeProperty?.tags?.find(
          (tag: { id: string; name: string }) => tag.id === selectDefaultValue,
        )?.name;
      }
    } else {
      return (
        defaultValue ??
        selectDefaultValue ??
        selectedField.typeProperty?.integerDefaultValue ??
        selectedField.typeProperty?.assetDefaultValue
      );
    }
  }, []);

  useEffect(() => {
    setMultipleValue(!!selectedField?.multiple);
    form.setFieldsValue({
      fieldId: selectedField?.id,
      title: selectedField?.title,
      description: selectedField?.description,
      key: selectedField?.key,
      multiple: !!selectedField?.multiple,
      unique: !!selectedField?.unique,
      isTitle: !!selectedField?.isTitle,
      required: !!selectedField?.required,
      defaultValue: selectedField ? defaultValueGet(selectedField) : undefined,
      min: selectedField?.typeProperty?.min,
      max: selectedField?.typeProperty?.max,
      maxLength: selectedField?.typeProperty?.maxLength,
      values: selectedField?.typeProperty?.values,
      tags: selectedField?.typeProperty?.tags,
      group: selectedField?.typeProperty?.groupId,
    });
  }, [defaultValueGet, form, selectedField]);

  const typePropertyGet = useCallback((values: FormTypes) => {
    switch (values.type) {
      case "TextArea":
        return {
          textArea: { defaultValue: values.defaultValue, maxLength: values.maxLength },
        };
      case "MarkdownText":
        return {
          markdownText: { defaultValue: values.defaultValue, maxLength: values.maxLength },
        };
      case "Asset":
        return {
          asset: { defaultValue: values.defaultValue },
        };
      case "Select": {
        const defaultValue = Array.isArray(values.defaultValue)
          ? values.defaultValue.filter((value: string) => value)
          : values.defaultValue ?? "";
        return {
          select: { defaultValue, values: values.values },
        };
      }
      case "Integer": {
        const defaultValue = Array.isArray(values.defaultValue)
          ? values.defaultValue.filter((value: number | string) => typeof value === "number")
          : values.defaultValue ?? "";
        return {
          integer: {
            defaultValue,
            min: values.min ?? null,
            max: values.max ?? null,
          },
        };
      }
      case "Bool":
        return {
          bool: { defaultValue: values.defaultValue },
        };
      case "Date":
        return {
          date: { defaultValue: transformMomentToString(values.defaultValue) ?? "" },
        };
      case "Tag":
        return {
          tag: { defaultValue: values.defaultValue, tags: values.tags },
        };
      case "Checkbox":
        return {
          checkbox: { defaultValue: values.defaultValue },
        };
      case "URL":
        return {
          url: { defaultValue: values.defaultValue },
        };
      case "Group":
        return {
          group: { groupId: values.group },
        };
      default:
        return {
          text: { defaultValue: values.defaultValue, maxLength: values.maxLength },
        };
    }
  }, []);

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        values.type = selectedType;
        values.typeProperty = typePropertyGet(values);
        values.metadata = isMeta;
        await onSubmit?.({
          ...values,
          fieldId: selectedField?.id,
        });
        setMultipleValue(false);
        onClose?.(true);
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, selectedType, typePropertyGet, isMeta, onSubmit, selectedField?.id, onClose]);

  const handleModalReset = useCallback(() => {
    form.resetFields();
    setActiveTab("settings");
  }, [form]);

  const handleModalCancel = useCallback(() => {
    setMultipleValue(false);
    onClose?.(true);
  }, [onClose]);

  const isRequiredDisabled = useMemo(
    () => selectedType === "Group" || selectedType === "Bool" || selectedType === "Checkbox",
    [selectedType],
  );

  const isUniqueDisabled = useMemo(
    () => selectedType === "Group" || selectedType === "Bool" || selectedType === "Checkbox",
    [selectedType],
  );

  return {
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
  };
};
