import { useAtom } from "jotai";
import { useUpdateAtom } from "jotai/utils";
import { useEffect, useState } from "react";
import { HashRouter } from "react-router-dom";
import { useMount, useTimeoutFn } from "react-use";

import Config from "~/components/config";
import Controller from "~/components/controller";
import { colorModeAtom, configAtom, ConfigType, editAtom, editingAtom } from "~/store";
import { addListener, initWs } from "~/ws";

const Main = () => {
  const [pwd, setPwd] = useState(import.meta.env.VITE_PWD);
  const [visible, setVisible] = useState(true);
  const [_, cancelVisible, resetVisible] = useTimeoutFn(() => setVisible(false), 5000);
  const [colorMode] = useAtom(colorModeAtom);
  const setConfig = useUpdateAtom(configAtom);
  const setEdit = useUpdateAtom(editAtom);
  const [editing, setEditing] = useAtom(editingAtom);

  useEffect(() => {
    if (!pwd) return;
    initWs(pwd);
  }, [pwd]);

  useMount(() => {
    if (import.meta.env.PROD) {
      const p = window.prompt("输入密码");
      if (p) {
        setPwd(p);
      }
    }
    addListener<ConfigType>("config", (cfg) => {
      setConfig(cfg);
    });
    addListener<boolean>("edit", (e) => setEdit(e));
    addListener<boolean>("editing", (e) => setEditing(e));
    document.addEventListener("mousedown", () => {
      setVisible(true);
      cancelVisible();
    });
    document.addEventListener("touchstart", () => {
      setVisible(true);
      cancelVisible();
    });
    document.addEventListener("mouseup", () => {
      resetVisible();
    });
    document.addEventListener("touchend", () => {
      resetVisible();
    });
  });
  return (
    <div>
      <img
        className={
          "h-screen w-screen object-contain " + (colorMode === "dark" ? "bg-black" : "bg-white")
        }
        src={"http://" + (import.meta.env.VITE_BACK_URL || window.location.host) + "/stream/" + pwd}
        alt="stream"
      />
      <div style={{ display: visible ? "block" : "none" }}>
        {editing ? <Controller /> : null}
        <Config />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <Main />
    </HashRouter>
  );
}
