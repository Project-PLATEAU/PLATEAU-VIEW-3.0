import {
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  styled,
  selectClasses,
  svgIconClasses,
} from "@mui/material";
import { endOfYear, format, set, startOfDay, startOfYear } from "date-fns";
import { omit } from "lodash";
import {
  forwardRef,
  useCallback,
  useRef,
  type ComponentPropsWithRef,
  type MouseEvent,
  type SyntheticEvent,
  useMemo,
} from "react";
import invariant from "tiny-invariant";

import { DateControlList } from "./DateControlList";
import { DateControlSliderGraph } from "./DateControlSliderGraph";
import { DateSlider } from "./DateSlider";
import { useDateControlState, type DateControlStateParams } from "./useDateControlState";

const Root = styled("div")(({ theme }) => ({
  padding: theme.spacing(3),
  paddingRight: theme.spacing(6),
  paddingBottom: theme.spacing(5),
}));

const DateWrapper = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
}));

const SelectWrapper = styled("div")(({ theme }) => ({
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
    const yearOptions = useMemo(() => {
      const currentYear = date.getFullYear();
      const years: number[] = [];
      for (let i = currentYear; i >= 1900; i -= 1) {
        years.push(i);
      }
      return years;
    }, [date]);

    return (
      <Root ref={ref} {...props}>
        <Stack direction="row" spacing={3} width="100%">
          <Stack spacing={2} width={200}>
            <Stack spacing={0.5}>
              <DateWrapper>
                <SelectWrapper>
                  <Select
                    value={year}
                    size="small"
                    autoWidth
                    MenuProps={{ sx: { maxHeight: 330 } }}
                    onChange={handleYearChange}>
                    {yearOptions.map(year => (
                      <MenuItem key={year} value={`${year}`}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </SelectWrapper>
                <DateText>{format(date, "年M'月'd'日'")}</DateText>
              </DateWrapper>

              <TimeText>{format(date, "H:mm")}</TimeText>
            </Stack>
            <DateControlList
              {...omit(state, ["dateAtom", "observerAtom"])}
              onChange={handleListChange}
            />
          </Stack>
          <Stack width="100%" spacing={2}>
            <DateSlider
              min={+startOfYear(date)}
              max={+startOfDay(endOfYear(date))}
              value={+startOfDay(date)}
              onChange={handleSliderChange}
            />
            <DateControlSliderGraph {...state} onChange={handleGraphSliderChange} />
          </Stack>
        </Stack>
      </Root>
    );
  },
);
