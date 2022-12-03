import "./index.scss";

import { useAtom, useAtomValue } from "jotai";
import { debounce } from "lodash";

import {
  ColorMode,
  colorModeAtom,
  configAtom,
  editingAtom,
  Resolution,
  resolutions,
} from "~/store";
import { sendMsg } from "~/ws";

import SvgIcon from "../SvgIcon";

const changeFramerate = debounce((fps) => {
  sendMsg({
    type: "config",
    msg: {
      key: "framerate",
      value: fps,
    },
  });
}, 1000);

export default function Config({ close: toggleConfig }: { close: () => void }) {
  const editing = useAtomValue(editingAtom);
  const [colorMode, changeColorMode] = useAtom(colorModeAtom);
  const [config, setConfig] = useAtom(configAtom);

  const toggleColorMode = () => {
    changeColorMode((c) => (c === ColorMode.dark ? ColorMode.light : ColorMode.dark));
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
    <div className="fixed left-0 top-0 z-30 h-screen w-screen bg-black/80">
      <div className="pi-config-container flexc relative z-30">
        <h2 className="mb-5 text-xl font-bold">配置项</h2>
        <span className="absolute right-2 top-2 cursor-pointer" onClick={() => toggleConfig()}>
          <SvgIcon className="fill-white square-8" name="close" />
        </span>
        <table className="w-full">
          <tbody>
            {editing ? (
              <ConfigLine label="分辨率">
                <select value={config.resolution} onChange={(e) => setResolution(e.target.value)}>
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
