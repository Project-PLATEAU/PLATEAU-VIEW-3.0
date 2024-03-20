import styled from "@emotion/styled";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

import { moveItemInArray } from "../moveItemArray";

type Props = {
  className?: string;
  checked?: boolean[];
  onChange?: (value: (string | number | boolean)[]) => void;
  FieldInput: React.FunctionComponent<any>;
  disabled?: boolean;
};

const MultiValueBooleanField: React.FC<Props> = ({
  className,
  checked = [],
  FieldInput,
  disabled,
  onChange,
}) => {
  const t = useT();
  const handleInput = useCallback(
    (e: boolean | CheckboxChangeEvent, id: number) => {
      const value = typeof e === "boolean" ? e : e.target.checked;
      onChange?.(checked?.map((valueItem, index) => (index === id ? value : valueItem)));
    },
    [onChange, checked],
  );

  useEffect(() => {
    if (typeof checked === "string" || typeof checked === "boolean") onChange?.([checked]);
    else if (!checked) onChange?.([]);
  }, [onChange, checked]);

  const handleInputDelete = useCallback(
    (key: number) => {
      onChange?.(
        checked.filter((_, index) => {
          return index !== key;
        }),
      );
    },
    [onChange, checked],
  );

  return (
    <div className={className}>
      {Array.isArray(checked) &&
        checked?.map((valueItem, key) => (
          <FieldWrapper key={key}>
            {!disabled && (
              <>
                <FieldButton
                  type="link"
                  icon={<Icon icon="arrowUp" />}
                  onClick={() => onChange?.(moveItemInArray(checked, key, key - 1))}
                  disabled={key === 0}
                />
                <FieldButton
                  type="link"
                  icon={<Icon icon="arrowDown" />}
                  onClick={() => onChange?.(moveItemInArray(checked, key, key + 1))}
                  disabled={key === checked.length - 1}
                />
              </>
            )}
            <FieldInput
              onChange={(e: boolean | CheckboxChangeEvent) => handleInput(e, key)}
              checked={valueItem}
            />

            <FlexSpace />
            {!disabled && (
              <FieldButton
                type="link"
                icon={<Icon icon="delete" />}
                onClick={() => handleInputDelete(key)}
              />
            )}
          </FieldWrapper>
        ))}
      {!disabled && (
        <Button
          icon={<Icon icon="plus" />}
          type="primary"
          onClick={() => {
            if (!checked) checked = [];
            onChange?.([...checked, false]);
          }}>
          {t("New")}
        </Button>
      )}
    </div>
  );
};

export default MultiValueBooleanField;

const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
`;

const FieldButton = styled(Button)`
  color: #000000d9;
  margin-top: 4px;
`;

const FlexSpace = styled.div`
  flex: 1;
`;
