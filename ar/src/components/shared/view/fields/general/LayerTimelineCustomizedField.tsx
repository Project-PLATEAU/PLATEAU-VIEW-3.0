// import { useAtom } from "jotai";
// import { FC, useMemo } from "react";

// import { ParameterItem, ParameterList } from "../../../../prototypes/ui-components";
// import { useTimeline } from "../../../reearth/hooks/useTimeline";
// import { TimelineCustomizedField } from "../../../types/fieldComponents/general";
// import { TimelineParameterItem } from "../../../ui-components/TimelineParameterItem";
// import { generateID } from "../../../utils/id";
// import { WritableAtomForComponent } from "../../../view-layers/component";
// import { activeTimelineComponentIdAtom } from "../../state/timeline";

// export interface LayerTimelineCustomizedFieldProps {
//   atoms: WritableAtomForComponent<TimelineCustomizedField>[];
// }

// export const LayerTimelineCustomizedField: FC<LayerTimelineCustomizedFieldProps> = ({ atoms }) => {
//   const [component] = useAtom(atoms[0]);
//   const id = useMemo(() => component.id ?? generateID(), [component.id]);

//   const {
//     handleTimelinePlay,
//     handleTimelinePlayReverse,
//     handleTimelinePause,
//     handleTimelineJump,
//     handleTimelineSetSpeed,
//     handleTimelineOnTickEventAdd,
//     handleTimelineOnTickEventRemove,
//   } = useTimeline();

//   return component.preset ? (
//     <ParameterList>
//       <ParameterItem label="タイムライン">
//         <TimelineParameterItem
//           id={id}
//           start={component.preset.start}
//           current={component.preset.current}
//           end={component.preset.end}
//           timezone={component.preset.timezone}
//           activeIdAtom={activeTimelineComponentIdAtom}
//           onPlay={handleTimelinePlay}
//           onPlayReverse={handleTimelinePlayReverse}
//           onPause={handleTimelinePause}
//           onJump={handleTimelineJump}
//           onSetSpeed={handleTimelineSetSpeed}
//           onTickEventAdd={handleTimelineOnTickEventAdd}
//           onTickEventRemove={handleTimelineOnTickEventRemove}
//         />
//       </ParameterItem>
//     </ParameterList>
//   ) : null;
// };
