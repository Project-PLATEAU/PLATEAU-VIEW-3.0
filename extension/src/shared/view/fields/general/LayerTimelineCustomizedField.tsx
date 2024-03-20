import { useAtom } from "jotai";
import { FC, useMemo } from "react";

import { ParameterItem, ParameterList } from "../../../../prototypes/ui-components";
import { useTimeline } from "../../../reearth/hooks/useTimeline";
import { TimelineCustomizedField } from "../../../types/fieldComponents/general";
import { TimelineParameterItem } from "../../../ui-components/TimelineParameterItem";
import { generateID } from "../../../utils/id";
import { WritableAtomForComponent } from "../../../view-layers/component";
import { activeTimelineComponentIdAtom } from "../../state/timeline";

export interface LayerTimelineCustomizedFieldProps {
  atoms: WritableAtomForComponent<TimelineCustomizedField>[];
}

export const LayerTimelineCustomizedField: FC<LayerTimelineCustomizedFieldProps> = ({ atoms }) => {
  const [component] = useAtom(atoms[0]);
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

  const start = useMemo(
    () => component.preset?.start ?? new Date().toISOString(),
    [component.preset],
  );
  const current = useMemo(() => component.preset?.current ?? start, [component.preset, start]);
  const end = useMemo(() => component.preset?.end ?? start, [component.preset, start]);
  const timezone = useMemo(() => component.preset?.timezone ?? "+9", [component.preset]);
  const defaultUnit = useMemo(() => component.preset?.defaultUnit, [component.preset]);
  const defaultAmount = useMemo(() => component.preset?.defaultAmount, [component.preset]);

  return start && current && end && timezone !== undefined ? (
    <ParameterList>
      <ParameterItem label="タイムライン">
        <TimelineParameterItem
          id={id}
          start={start}
          current={current}
          end={end}
          timezone={timezone}
          defaultUnit={defaultUnit}
          defaultAmount={defaultAmount}
          activeIdAtom={activeTimelineComponentIdAtom}
          onPlay={handleTimelinePlay}
          onPlayReverse={handleTimelinePlayReverse}
          onPause={handleTimelinePause}
          onJump={handleTimelineJump}
          onSetSpeed={handleTimelineSetSpeed}
          onTickEventAdd={handleTimelineOnTickEventAdd}
          onTickEventRemove={handleTimelineOnTickEventRemove}
        />
      </ParameterItem>
    </ParameterList>
  ) : null;
};
