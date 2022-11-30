import "./index.scss";

import { useAtom, useAtomValue } from "jotai";
import { debounce } from "lodash";
import { useState } from "react";

import {
  ColorMode,
  colorModeAtom,
  configAtom,
  editAtom,
  editingAtom,
  Resolution,
  resolutions,
} from "~/store";
import { sendMsg } from "~/ws";

import SvgIcon from "../SvgIcon";

const s = 1;

const changeFramerate = debounce((fps) => {
  sendMsg({
    type: "config",
    msg: {
      key: "framerate",
      value: fps,
    },
  });
}, 1000);

export default function Config() {
  const editing = useAtomValue(editingAtom);
  const canEdit = useAtomValue(editAtom);
  const [colorMode, changeColorMode] = useAtom(colorModeAtom);
  const [configVisible, toggleConfig] = useState(false);
  const [config, setConfig] = useAtom(configAtom);

  const toggleColorMode = () => {
    changeColorMode((c) => (c === ColorMode.dark ? ColorMode.light : ColorMode.dark));
  };

  const toggleEdit = () => {
    if (canEdit || editing) {
      sendMsg({
        type: editing ? "release" : "acquire",
      });
    }
  };

  const setResolution = (r: string) => {
    setConfig((cfg) => ({
      ...cfg,
      resolution: r as Resolution,
    }));
    sendMsg({
      type: "config",
      msg: {
        key: "resolution",
        value: r,
      },
    });
  };

  const setFramerate = (fps: number) => {
    setConfig((cfg) => ({
      ...cfg,
      framterate: fps,
    }));
    changeFramerate(fps);
  };

  return (
    <div className="pi-config">
      <div className="fixed left-0 bottom-0 z-20 flex">
        <button className="config-btn mx-5" onClick={() => toggleConfig(true)}>
          配置
        </button>
        <button className="config-btn" onClick={() => toggleEdit()}>
          {editing ? "结束控制" : canEdit ? "开始控制" : "其他人正在控制..."}
        </button>
      </div>
      {configVisible ? (
        <div className="fixed left-0 top-0 z-30 h-screen w-screen bg-black/80">
          <div className="config-container flexc relative z-30">
            <h2 className="mb-5 text-xl font-bold">配置项</h2>
            <span
              className="absolute right-2 top-2 cursor-pointer"
              onClick={() => toggleConfig(false)}
            >
              <SvgIcon className="fill-white square-8" name="close" />
            </span>
            <table className="w-full">
              <tbody>
                {editing ? (
                  <ConfigLine label="分辨率">
                    <select
                      value={config.resolution}
                      onChange={(e) => setResolution(e.target.value)}
                    >
                      {resolutions.map((r) => (
                        <option>{r}</option>
                      ))}
                    </select>
                  </ConfigLine>
                ) : null}
                {editing ? (
                  <ConfigLine label="刷新率">
                    <input
                      value={config.framterate}
                      type="number"
                      onChange={(e) => setFramerate(+e.target.value)}
                    />
                  </ConfigLine>
                ) : null}
                <ConfigLine label="界面">
                  <label className="flex" htmlFor="pi-change-color-mode">
                    <input
                      id="pi-change-color-mode"
                      onChange={() => toggleColorMode()}
                      className="hidden"
                      type="checkbox"
                    />
                    <span
                      className={
                        "cursor-pointer rounded-sm p-3" + (colorMode === "light" ? " border" : "")
                      }
                    >
                      <SvgIcon className="fill-white square-7" name="light" />
                    </span>
                    <span
                      className={
                        "cursor-pointer rounded-sm p-3" + (colorMode === "dark" ? " border" : "")
                      }
                    >
                      <SvgIcon className="fill-white square-7" name="dark" />
                    </span>
                  </label>
                </ConfigLine>
                <ConfigLine label="休眠">
                  <input type="number" min="0" />
                </ConfigLine>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ConfigLine({ children, label }: { children: JSX.Element; label: string }) {
  return (
    <tr>
      <td className="py-5 text-center font-bold">{label}</td>
      <td>{children}</td>
    </tr>
  );
}
