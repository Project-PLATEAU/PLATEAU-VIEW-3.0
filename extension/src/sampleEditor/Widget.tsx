import { Button } from "@mui/material";
import { PrimitiveAtom, useAtomValue, useSetAtom } from "jotai";
import { ChangeEvent, FC, memo, useCallback, useDeferredValue, useRef, useState } from "react";

import { FieldType } from "../editor/containers/common/fieldComponentEditor/fields";
import { Setting, SettingComponent } from "../shared/api/types";
import { WidgetContext } from "../shared/context/WidgetContext";
import {
  addSettingAtom,
  removeSettingAtom,
  settingsAtomsAtom,
  updateSettingAtom,
} from "../shared/states/setting";
import {
  POINT_FILL_COLOR_VALUE_FIELD,
  POINT_SIZE_FIELD,
} from "../shared/types/fieldComponents/point";

// Setting for 避難施設情報（千代田区）
const mockSetting: Setting = {
  id: "3",
  datasetId: "d_13101_shelter",
  dataId: "di_13101_shelter",
  fieldComponents: {
    groups: [
      {
        id: "1",
        name: "",
        components: [
          {
            type: POINT_FILL_COLOR_VALUE_FIELD,
            preset: {
              defaultValue: "#f0ff00",
            },
          } as SettingComponent<"POINT_FILL_COLOR_VALUE_FIELD">,
          {
            type: POINT_SIZE_FIELD,
            preset: {
              defaultValue: 100,
            },
          } as SettingComponent<"POINT_SIZE_FIELD">,
        ],
      },
    ],
  },
};

const ComponentItem: FC<{
  component: SettingComponent<FieldType>;
  setting: Setting;
  settingIndex: number;
  componentIndex: number;
  groupIndex: number;
}> = ({ component, setting, componentIndex, groupIndex }) => {
  const [value, setValue] = useState({
    type: typeof component.preset?.defaultValue,
    groupIndex,
    componentIndex,
    value: component.preset?.defaultValue,
  });
  const deferredValue = useDeferredValue(value);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(v => ({ ...v, value: e.target.value }));
  }, []);

  const updateSetting = useSetAtom(updateSettingAtom);

  const settingRef = useRef(setting);
  settingRef.current = setting;

  const apply = useCallback(() => {
    const s = settingRef.current;

    updateSetting({
      ...s,
      fieldComponents: {
        ...s.fieldComponents,
        groups: s.fieldComponents?.groups?.map((g, gi) => ({
          ...g,
          components: g.components.map((c, ci) =>
            deferredValue.groupIndex === gi && deferredValue.componentIndex === ci
              ? {
                  ...c,
                  preset: {
                    defaultValue:
                      deferredValue.type === "string"
                        ? (deferredValue.value as any)
                        : Number(deferredValue.value) ?? 0,
                  },
                }
              : c,
          ),
        })),
      },
    });
  }, [deferredValue, updateSetting]);

  return (
    <li>
      <label>{component.type}: </label>
      <input onChange={handleChange} value={value.value} />
      <Button onClick={apply} color="warning">
        Apply
      </Button>
    </li>
  );
};

const SettingItem: FC<{ settingAtom: PrimitiveAtom<Setting>; index: number }> = ({
  settingAtom,
  index,
}) => {
  const setting = useAtomValue(settingAtom);

  const removeSetting = useSetAtom(removeSettingAtom);
  const handleRemoveSetting = useCallback(() => {
    removeSetting(settingAtom);
  }, [removeSetting, settingAtom]);

  return (
    <li>
      <h3>{setting.datasetId}</h3>
      <Button color="error" onClick={handleRemoveSetting}>
        Remove
      </Button>
      <ul>
        {setting.fieldComponents?.groups?.map((group, gi) => {
          return (
            <li key={group.id}>
              {group.id}
              <ul>
                {group.components.map((c, ci) => {
                  return (
                    <ComponentItem
                      key={ci.toString()}
                      component={c}
                      setting={setting}
                      settingIndex={index}
                      groupIndex={gi}
                      componentIndex={ci}
                    />
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </li>
  );
};

const App: FC = () => {
  const settingAtoms = useAtomValue(settingsAtomsAtom);

  const addSetting = useSetAtom(addSettingAtom);
  const handleAddSetting = useCallback(() => {
    addSetting(mockSetting);
  }, [addSetting]);

  return (
    <div style={{ background: "#999999" }}>
      <h2>Settings</h2>
      <ul>
        {settingAtoms.map((settingAtom, i) => (
          <SettingItem key={i.toString()} settingAtom={settingAtom} index={i} />
        ))}
      </ul>
      <Button color="primary" onClick={handleAddSetting}>
        add setting for shelter
      </Button>
    </div>
  );
};

export const Widget: FC = memo(function WidgetPresenter() {
  return (
    <WidgetContext>
      <App />
    </WidgetContext>
  );
});
