import styled from "@emotion/styled";
import { SetStateAction } from "jotai";
import moment from "moment";
import { Dispatch } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import Tag from "@reearth-cms/components/atoms/Tag";
import {
  DefaultFilterValueType,
  DropdownFilterType,
} from "@reearth-cms/components/molecules/Content/Table/types";
import { AndConditionInput } from "@reearth-cms/components/molecules/View/types";
import { CurrentViewType } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const { Option } = Select;

type Props = {
  filter: DropdownFilterType;
  close: () => void;
  defaultValue?: DefaultFilterValueType;
  open: boolean;
  isFilter: boolean;
  index: number;
  currentView?: CurrentViewType;
  setCurrentView?: Dispatch<SetStateAction<CurrentViewType>>;
  onFilterChange?: (filter?: AndConditionInput) => void;
};

const DropdownRender: React.FC<Props> = ({
  filter,
  close,
  defaultValue,
  open,
  isFilter,
  index,
  currentView,
  setCurrentView,
  onFilterChange,
}) => {
  const t = useT();

  const {
    valueOptions,
    options,
    form,
    confirm,
    isShowInputField,
    onFilterSelect,
    onValueSelect,
    onNumberChange,
    onInputChange,
    onDateChange,
  } = useHooks(
    filter,
    close,
    open,
    isFilter,
    index,
    defaultValue,
    currentView,
    setCurrentView,
    onFilterChange,
  );
  return (
    <StyledForm form={form} name="basic" autoComplete="off" colon={false}>
      <Container>
        <StyledFormItem label={<TextWrapper>{filter.title}</TextWrapper>} name="condition">
          <Select
            style={{ width: 160 }}
            options={options}
            onSelect={onFilterSelect}
            defaultValue={defaultValue?.operator ?? options[0].value}
            key={defaultValue?.operator}
          />
        </StyledFormItem>
        {isFilter && isShowInputField && (
          <StyledFormItem name="value">
            {filter.type === "Select" ||
            filter.type === "Tag" ||
            filter.type === "Person" ||
            filter.type === "Bool" ||
            filter.type === "Checkbox" ? (
              <Select
                placeholder="Select the value"
                onSelect={onValueSelect}
                defaultValue={defaultValue?.value?.toString()}
                key={defaultValue?.value}>
                {valueOptions.map(option => (
                  <Option key={option.value} value={option.value} label={option.label}>
                    {filter.type === "Tag" ? (
                      <Tag color={option.color?.toLocaleLowerCase()}>{option.label}</Tag>
                    ) : (
                      option.label
                    )}
                  </Option>
                ))}
              </Select>
            ) : filter.type === "Integer" /*|| filter.type === "Float"*/ ? (
              <InputNumber
                onChange={onNumberChange}
                stringMode
                defaultValue={defaultValue?.value}
                style={{ width: "100%" }}
                placeholder="Enter the value"
                key={defaultValue?.value}
              />
            ) : filter.type === "Date" ? (
              <DatePicker
                onChange={onDateChange}
                style={{ width: "100%" }}
                placeholder="Select the date"
                showToday={false}
                defaultValue={
                  defaultValue && defaultValue.value !== "" ? moment(defaultValue.value) : undefined
                }
                key={defaultValue?.value}
              />
            ) : (
              <Input
                onChange={onInputChange}
                defaultValue={defaultValue?.value}
                placeholder="Enter the value"
                key={defaultValue?.value}
              />
            )}
          </StyledFormItem>
        )}
      </Container>
      <StyledDivider />
      <ButtonsFormItem>
        <Space size="small">
          <Button type="default" onClick={close}>
            {t("Cancel")}
          </Button>
          <Button type="primary" htmlType="submit" onClick={confirm}>
            {t("Confirm")}
          </Button>
        </Space>
      </ButtonsFormItem>
    </StyledForm>
  );
};

export default DropdownRender;

const StyledForm = styled(Form)`
  background-color: white;
  box-shadow:
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

const Container = styled.div`
  padding: 9px 12px 0;
`;

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 8px;
`;

const TextWrapper = styled.span`
  min-width: 137px;
  text-align: left;
`;

const StyledDivider = styled(Divider)`
  margin: 0;
`;

const ButtonsFormItem = styled(Form.Item)`
  text-align: right;
  padding: 8px 4px;
`;
