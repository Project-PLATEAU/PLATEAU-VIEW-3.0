import { useAtom } from "jotai";
import { useState } from "react";

import { WidgetContext } from "../shared/context/WidgetContext";
import { countAtom } from "../shared/states/count";

export const Widget = () => {
  const [count, setCount] = useState(0);
  const [{ value: globalCount }, setGlobalCount] = useAtom(countAtom);

  return (
    <WidgetContext>
      <div style={{ background: "blue" }}>
        <button onClick={() => setCount(n => n + 1)}>Local: {count}</button>
        <br />
        <button onClick={() => setGlobalCount(async c => c + 1)}>Global: {globalCount}</button>
      </div>
    </WidgetContext>
  );
};
