import "./index.scss";

import { saveAs } from "file-saver";
import { useAtomValue } from "jotai";
import { useState } from "react";

import { editAtom, editingAtom } from "~/store";
import { getHttpPrefix } from "~/utils";
import { sendMsg } from "~/ws";

import Config from "../config";
import SvgIcon from "../SvgIcon";

export default function Operations({ pwd }: { pwd: string }) {
  const editing = useAtomValue(editingAtom);
  const canEdit = useAtomValue(editAtom);
  const [configVisible, toggleConfig] = useState(false);
  const [screenshotting, toggleScreenshotting] = useState(false);

  const toggleEdit = () => {
    if (canEdit || editing) {
      sendMsg({
        type: editing ? "release" : "acquire",
      });
    }
  };

  const screenshot = () => {
    if (screenshotting) return;
    toggleScreenshotting(true);
    fetch(`${getHttpPrefix()}/screenshot/${pwd}`)
      .then(async (res) => {
        if (res.status === 200) {
          const blob = await res.blob();
          saveAs(blob, `${new Date().toLocaleString()}.${blob.type.split("/")[1]}`);
        }
      })
      .finally(() => {
        toggleScreenshotting(false);
      });
  };

  return (
    <div className="pi-operations">
      <div className="fixed left-0 bottom-0 z-20 flex flex-wrap p-4">
        <button className="config-btn" onClick={() => toggleConfig(true)}>
          配置
        </button>
        <button className="config-btn" onClick={() => toggleEdit()}>
          {editing ? "结束控制" : canEdit ? "开始控制" : "其他人正在控制..."}
        </button>
        <button className="config-btn flex" onClick={() => screenshot()}>
          {screenshotting ? (
            <SvgIcon className="mr-2 stroke-white square-5" name="loading" />
          ) : null}
          截图
        </button>
      </div>
      {configVisible ? <Config close={() => toggleConfig(false)} /> : null}
    </div>
  );
}
