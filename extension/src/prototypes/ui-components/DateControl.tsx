import {
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  styled,
  selectClasses,
  svgIconClasses,
  useTheme,
  useMediaQuery,
  Popover,
  Box,
  IconButton,
} from "@mui/material";
import { endOfYear, format, set, startOfDay, startOfYear } from "date-fns";
import { omit } from "lodash";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import {
  forwardRef,
  useCallback,
  useRef,
  type ComponentPropsWithRef,
  type MouseEvent,
  type SyntheticEvent,
  useMemo,
  useId,
  memo,
} from "react";
import invariant from "tiny-invariant";

import { DateControlList } from "./DateControlList";
import { DateControlSliderGraph } from "./DateControlSliderGraph";
import { DateSlider } from "./DateSlider";
import { ListIcon } from "./icons";
import { useDateControlState, type DateControlStateParams } from "./useDateControlState";

const Root = styled("div")(({ theme }) => ({
  padding: theme.spacing(3),
  paddingRight: theme.spacing(6),
  paddingBottom: theme.spacing(5),
  [theme.breakpoints.down("mobile")]: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(3),
    width: `calc(100vw - ${theme.spacing(2)})`,
  },
  ["&, *"]: {
    boxSizing: "border-box",
  },
}));

const DateWrapper = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
}));

const SelectWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  [`& .${selectClasses.select}`]: {
    padding: `${theme.spacing(0, 0.5)} !important`,
  },
  [`& .${svgIconClasses.root}`]: {
    display: "none",
  },
}));

const DateText = styled("div")(({ theme }) => ({
  ...theme.typography.body1,
  fontVariantNumeric: "tabular-nums",
}));

const TimeText = styled("div")(({ theme }) => ({
  ...theme.typography.h4,
  fontVariantNumeric: "tabular-nums",
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(-1),
}));

const StyledMenuItem = styled(MenuItem)(() => ({
  minHeight: "auto",
}));

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= 1900; i -= 1) {
    years.push(i);
  }
  return years;
};

const yearOptions = generateYears();

const YearSelector = ({
  year,
  onChange,
}: {
  year: string;
  onChange: (event: SelectChangeEvent) => void;
}) => {
  return (
    <Select
      value={year}
      size="small"
      autoWidth
      MenuProps={{ sx: { maxHeight: 330 } }}
      onChange={onChange}>
      {yearOptions.map(year => (
        <StyledMenuItem key={year} value={`${year}`}>
          {year}
        </StyledMenuItem>
      ))}
    </Select>
  );
};

const MemoizedYearSelector = memo(YearSelector);

export interface DateControlProps
  extends Omit<ComponentPropsWithRef<typeof Root>, "children" | "onChange">,
    DateControlStateParams {
  onChange?: (event: SyntheticEvent | Event, date: Date) => void;
}

export const DateControl = forwardRef<HTMLDivElement, DateControlProps>(
  ({ date, longitude, latitude, height, onChange, ...props }, ref) => {
    const state = useDateControlState({
      date,
      longitude,
      latitude,
      height,
    });

    const dateRef = useRef(date);
    dateRef.current = date;

    const handleListChange = useCallback(
      (event: MouseEvent<HTMLDivElement>, values: Parameters<typeof set>[1]) => {
        onChange?.(event, set(dateRef.current, values));
      },
      [onChange],
    );

    const handleSliderChange = useCallback(
      (event: Event, value: number | number[]) => {
        invariant(!Array.isArray(value));
        const date = new Date(value);
        onChange?.(
          event,
          set(dateRef.current, {
            month: date.getMonth(),
            date: date.getDate(),
          }),
        );
      },
      [onChange],
    );

    const handleGraphSliderChange = useCallback(
      (event: Event, value: number | number[]) => {
        invariant(!Array.isArray(value));
        const date = new Date(value);
        onChange?.(
          event,
          set(dateRef.current, {
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds(),
            milliseconds: date.getMilliseconds(),
          }),
        );
      },
      [onChange],
    );

    const handleYearChange = useCallback(
      (event: SelectChangeEvent) => {
        onChange?.(event, set(dateRef.current, { year: Number(event.target.value) }));
      },
      [onChange],
    );

    const year = useMemo(() => `${date.getFullYear()}`, [date]);

    const id = useId();
    const popupState = usePopupState({
      variant: "popover",
      popupId: id,
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));
    return (
      <Root ref={ref} {...props}>
        <Stack
          width="100%"
          {...(isMobile ? { direction: "column", spacing: 1 } : { direction: "row", spacing: 3 })}>
          <Stack
            {...(isMobile
              ? { direction: "row", justifyContent: "space-between" }
              : { direction: "column", spacing: 2, width: 200 })}>
            <Stack
              {...(isMobile
                ? { direction: "row", spacing: 2, alignItems: "center" }
                : { direction: "column", spacing: 0.5 })}>
              <DateWrapper>
                <SelectWrapper>
                  <MemoizedYearSelector year={year} onChange={handleYearChange} />
                </SelectWrapper>
                <DateText>{format(date, "年M'月'd'日'")}</DateText>
              </DateWrapper>
              <TimeText>{format(date, "H:mm")}</TimeText>
            </Stack>
            {!isMobile ? (
              <DateControlList
                {...omit(state, ["dateAtom", "observerAtom"])}
                onChange={handleListChange}
              />
            ) : (
              <>
                <StyledIconButton {...bindTrigger(popupState)}>
                  <ListIcon fontSize="medium" />
                </StyledIconButton>
                <Popover
                  {...bindPopover(popupState)}
                  anchorOrigin={{
                    horizontal: "right",
                    vertical: "bottom",
                  }}
                  transformOrigin={{
                    horizontal: "right",
                    vertical: "top",
                  }}>
                  <Box width={200} padding={2} boxSizing={"border-box"}>
                    <DateControlList
                      {...omit(state, ["dateAtom", "observerAtom"])}
                      onChange={handleListChange}
                    />
                  </Box>
                </Popover>
              </>
            )}
          </Stack>
          <Stack width="100%" spacing={2}>
            <div>
              <DateSlider
                min={+startOfYear(date)}
                max={+startOfDay(endOfYear(date))}
                value={+startOfDay(date)}
                onChange={handleSliderChange}
              />
            </div>
            <DateControlSliderGraph {...state} onChange={handleGraphSliderChange} />
          </Stack>
        </Stack>
      </Root>
    );
  },
);

// const YearSelector: React.FC<{ year: number; onChange: (year: number) => void }> = ({
