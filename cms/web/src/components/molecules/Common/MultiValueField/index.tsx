import styled from "@emotion/styled";
import moment, { Moment } from "moment";
import { ChangeEvent, useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { InputProps } from "@reearth-cms/components/atoms/Input";
import { TextAreaProps } from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";

import { moveItemInArray } from "./moveItemArray";

type Props = {
  className?: string;
  value?: (string | number | Moment)[];
  onChange?: (value: (string | number | Moment)[]) => void;
  onBlur?: () => Promise<void>;
  FieldInput: React.FunctionComponent<any>;
} & TextAreaProps &
  InputProps;

const MultiValueField: React.FC<Props> = ({
  className,
  value = [],
  onChange,
  onBlur,
  FieldInput,
  ...props
}) => {
  const t = useT();
  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement | undefined>, id: number) => {
      onChange?.(
        value?.map((valueItem, index) =>
          index === id
            ? typeof e === "number" || moment.isMoment(e)
              ? e
              : e?.target.value
            : valueItem,
        ),
      );
    },
    [onChange, value],
  );

  useEffect(() => {
    if (!value) onChange?.([]);
    if (moment.isMoment(value)) onChange?.([value]);
  }, [onChange, value]);

  const handleInputDelete = useCallback(
    (key: number) => {
      onChange?.(
        value.filter((_, index) => {
          return index !== key;
        }),
      );
    },
    [onChange, value],
  );

  return (
    <div className={className}>
      {Array.isArray(value) &&
        value?.map((valueItem, key) => (
          <FieldWrapper key={key}>
            {!props.disabled && (
              <>
                <FieldButton
                  type="link"
                  icon={<Icon icon="arrowUp" />}
                  onClick={() => {
                    onChange?.(moveItemInArray(value, key, key - 1));
                    onBlur?.();
                  }}
                  disabled={key === 0}
                />
                <FieldButton
                  type="link"
                  icon={<Icon icon="arrowDown" />}
                  onClick={() => {
                    onChange?.(moveItemInArray(value, key, key + 1));
                    onBlur?.();
                  }}
                  disabled={key === value.length - 1}
                />
              </>
            )}
            <FieldInput
              style={{ flex: 1 }}
              {...props}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInput(e, key)}
              onBlur={() => onBlur?.()}
              value={valueItem}
            />
            {!props.disabled && (
              <FieldButton
                type="link"
                icon={<Icon icon="delete" />}
                onClick={() => {
                  handleInputDelete(key);
                  onBlur?.();
                }}
              />
            )}
          </FieldWrapper>
        ))}
      {!props.disabled && (
        <Button
          icon={<Icon icon="plus" />}
          type="primary"
          onClick={() => {
            const currentValues = value || [];
            const defaultValue = props.type === "date" ? moment() : "";
            if (Array.isArray(currentValues)) {
              onChange?.([...currentValues, defaultValue]);
            } else {
              onChange?.([currentValues, defaultValue]);
            }
          }}>
          {t("New")}
        </Button>
      )}
    </div>
  );
};

export default MultiValueField;

const FieldWrapper = styled.div`
  display: flex;
  margin: 8px 0;
`;

const FieldButton = styled(Button)`
  color: #000000d9;
  margin-top: 4px;
`;
