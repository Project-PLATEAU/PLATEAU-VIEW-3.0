import { useAtom } from "jotai";
import { FC, useMemo } from "react";

import { ParameterItem, ParameterList } from "../../../../prototypes/ui-components";
import { useTimeline } from "../../../reearth/hooks/useTimeline";
import { TimelineMonthField } from "../../../types/fieldComponents/general";
import { TimelineParameterItem } from "../../../ui-components/TimelineParameterItem";
import { generateID } from "../../../utils/id";
import { WritableAtomForComponent } from "../../../view-layers/component";
import { activeTimelineComponentIdAtom } from "../../state/timeline";

export interface LayerTimelineMonthFieldProps {
  atoms: WritableAtomForComponent<TimelineMonthField>[];
}

export const LayerTimelineMonthField: FC<LayerTimelineMonthFieldProps> = ({ atoms }) => {
  const [component] = useAtom(atoms[0]);

  const timezone = useMemo(() => {
    const offset = new Date().getTimezoneOffset() / -60;
    return offset > 0 ? `+${offset}` : `${offset}`;
  }, []);

  const end = useMemo(() => new Date().toISOString(), []);
  const start = useMemo(() => {
    const date = new Date(end);
    date.setMonth(date.getMonth() - 1);
    return date.toISOString();
  }, [end]);

  const id = useMemo(() => component.id ?? generateID(), [component.id]);

  const {
    handleTimelinePlay,
    handleTimelinePlayReverse,
    handleTimelinePause,
    handleTimelineJump,
    handleTimelineSetSpeed,
    handleTimelineOnTickEventAdd,
    handleTimelineOnTickEventRemove,
  } = useTimeline();

  return (
    <ParameterList>
      <ParameterItem label="タイムライン">
        {!!start && !!end && !!timezone && (
          <TimelineParameterItem
            id={id}
            start={start}
            current={start}
            end={end}
            timezone={timezone}
            activeIdAtom={activeTimelineComponentIdAtom}
            onPlay={handleTimelinePlay}
            onPlayReverse={handleTimelinePlayReverse}
            onPause={handleTimelinePause}
            onJump={handleTimelineJump}
            onSetSpeed={handleTimelineSetSpeed}
            onTickEventAdd={handleTimelineOnTickEventAdd}
            onTickEventRemove={handleTimelineOnTickEventRemove}
          />
        )}
      </ParameterItem>
    </ParameterList>
  );
};
