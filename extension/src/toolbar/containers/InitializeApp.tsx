import { useAtomValue, useSetAtom } from "jotai";
import { FC, useEffect, useLayoutEffect } from "react";

import { useSettingClient, useTemplateClient } from "../../shared/api/hooks";
import { useTimeline } from "../../shared/reearth/hooks/useTimeline";
import { fetchShare } from "../../shared/sharedAtoms";
import { sharedInitialClockAtom } from "../../shared/states/scene";
import { updateAllSettingAtom } from "../../shared/states/setting";
import { updateAllTemplateAtom } from "../../shared/states/template";
import { isAppReadyAtom } from "../../shared/view/state/app";
import { useInteractionMode } from "../hooks/useInteractionMode";

export const InitializeApp: FC = () => {
  const settingClient = useSettingClient();
  const templateClient = useTemplateClient();

  const updateAllSetting = useSetAtom(updateAllSettingAtom);

  const updateAllTemplate = useSetAtom(updateAllTemplateAtom);

  const setIsAppReady = useSetAtom(isAppReadyAtom);
  useEffect(() => {
    const fetch = async () => {
      fetchShare();
      const [settings, templates] = await Promise.all([
        settingClient.findAll(),
        templateClient.findAll(),
      ]);
      updateAllSetting(settings);
      updateAllTemplate(Array.isArray(templates) ? templates : []);
      setIsAppReady(true);
    };
    fetch();
  }, [setIsAppReady, settingClient, templateClient, updateAllSetting, updateAllTemplate]);

  const initialClock = useAtomValue(sharedInitialClockAtom);

  // Initialze clock to 10am JST of current date
  const { handleTimelineJump } = useTimeline();
  useLayoutEffect(() => {
    if (initialClock.value) {
      const now = new Date(initialClock.value);
      handleTimelineJump({ start: now, stop: now, current: now });
      return;
    }
    const timezone = 9; // JST
    const now = new Date();
    now.setUTCHours(10 - timezone, 0, 0, 0);
    handleTimelineJump({ start: now, stop: now, current: now });
  }, [handleTimelineJump, initialClock]);

  useInteractionMode();

  return null;
};
