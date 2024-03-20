import { useAutocomplete, AutocompleteGetTagProps } from "@mui/base/useAutocomplete";
import { ArrowDropDown } from "@mui/icons-material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Chip } from "@mui/material";
import { autocompleteClasses } from "@mui/material/Autocomplete";
import { styled } from "@mui/material/styles";
import { Fragment, ReactElement, SyntheticEvent } from "react";

import { SearchIcon } from "../../prototypes/ui-components";

const Root = styled("div")(
  ({ theme }) => `
  color: ${theme.palette.text.primary};
  font-size: 12px;
  position: relative;
  width: 100%;
`,
);

const Label = styled("label")`
  padding: 0 0 5px;
  display: inline-block;
  word-break: break-all;
`;

const InputWrapper = styled("div")(
  ({ theme }) => `
  width: 100%;
  border: 1px solid ${theme.palette.divider};
  background-color: ${theme.palette.background.default};
  border-radius: 4px;
  padding: 5px 36px 5px 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  box-sizing: border-box;
  gap: 5px;
  position: relative;

  &:hover {
    border-color: ${theme.palette.primary.main};
  }

  &.focused {
    border-color: ${theme.palette.primary.main};
  }

  & input {
    background-color: ${theme.palette.background.default};
    color: ${theme.palette.text.primary};
    box-sizing: border-box;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
    height: 24px;
  }

  & > svg {
    position: absolute;
    right: 6px;
  }
`,
);

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  label: string;
}

const StyledChip = styled(Chip)<TagProps>(({ theme }) => ({ ...theme.typography.body2 }));

const Listbox = styled("ul")<{ position: "top" | "bottom" }>(
  ({ theme, position }) => `
  width: 300px;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: ${theme.palette.background.default};
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
  width: 100%;
  ${position === "top" ? "bottom: 40px;" : ""}

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: ${theme.palette.primary.main}19;

    & svg {
      color: ${theme.palette.primary.main};
    }
  }

  & li[aria-selected='true'].${autocompleteClasses.focused} {
    background-color: ${theme.palette.primary.main}19;
  }

  & li.${autocompleteClasses.focused} {
    background-color: ${theme.palette.grey[100]};
    cursor: pointer;
  }
`,
);

export type Props<Option extends { label: string; value: string }> = {
  title: string;
  position?: "top" | "bottom";
  placeholder?: string;
  options: Option[];
  onChange?: (e: SyntheticEvent, value: Props<Option>["options"]) => void;
  values?: Props<Option>["options"];
};

export const MultipleSelectSearch = <Option extends { label: string; value: string }>({
  title,
  options,
  placeholder,
  onChange,
  position = "bottom",
  values,
}: Props<Option>): ReactElement | null => {
  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    multiple: true,
    options,
    disableCloseOnSelect: true,
    openOnFocus: true,
    getOptionLabel: option => option.label,
    onChange,
    value: values,
  });

  const List =
    groupedOptions.length > 0 ? (
      <Listbox {...getListboxProps()} position={position}>
        {(groupedOptions as typeof options).map((option, index) => (
          <li key={option.label} {...getOptionProps({ option, index })}>
            <span>{option.label}</span>
            <CheckIcon fontSize="small" />
          </li>
        ))}
      </Listbox>
    ) : null;

  return (
    <Root>
      {position === "top" && List}
      <div {...getRootProps()}>
        <Label {...getInputLabelProps()}>{title}</Label>
        <InputWrapper ref={setAnchorEl} className={focused ? "focused" : ""}>
          {value.map(({ label }, index: number) => (
            <Fragment key={label}>
              <StyledChip
                {...getTagProps({ index })}
                label={label}
                size="small"
                deleteIcon={<CloseIcon />}
              />
            </Fragment>
          ))}
          <input {...getInputProps()} placeholder={!value.length ? placeholder : undefined} />
          {focused ? <SearchIcon /> : <ArrowDropDown />}
        </InputWrapper>
      </div>
      {position === "bottom" && List}
    </Root>
  );
};
