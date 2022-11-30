import "./index.scss";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { configAtom, Orient } from "~/store";
import { sendMsg } from "~/ws";

export default function Controller() {
  const [config, setConfig] = useAtom(configAtom);
  const [xInput, setX] = useState(config.x_duty);
  const [yInput, setY] = useState(config.y_duty);

  useEffect(() => {
    setX(100 - config.x_duty);
    setY(config.y_duty);
  }, [config.x_duty, config.y_duty]);

  const slide = (orient: Orient, duty: number) => {
    if (duty > 0) {
      const key = orient === -1 ? "x_duty" : "y_duty";
      setConfig((cfg) => ({
        ...cfg,
        [key]: config[key],
      }));
      if (orient === -1) {
        setX(duty);
      } else {
        setY(duty);
      }
      if (orient === -1) {
        duty = 100 - duty;
      }
    }

    sendMsg({
      type: "move",
      msg: {
        orient,
        duty,
      },
    });
  };

  return (
    <div className="pi-controller fixed top-0 left-0 z-10 w-screen">
      <input
        className="x"
        type="range"
        min="1"
        max="100"
        value={xInput}
        onChange={(e) => slide(Orient.X, +e.target.value)}
        onMouseUp={() => slide(Orient.X, -1)}
        onTouchEnd={() => slide(Orient.X, -1)}
      />
      <input
        className="y"
        type="range"
        min="1"
        max="100"
        value={yInput}
        onChange={(e) => slide(Orient.Y, +e.target.value)}
        onMouseUp={() => slide(Orient.Y, -1)}
        onTouchEnd={() => slide(Orient.Y, -1)}
      />
    </div>
  );
}
