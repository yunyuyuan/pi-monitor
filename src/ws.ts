export let ws: WebSocket;

export const initWs = (pwd: string) => {
  console.log("init ws");

  ws = new WebSocket(
    `ws${window.location.protocol.startsWith("https") ? "s" : ""}://${
      import.meta.env.VITE_BACK_URL || window.location.host
    }/ws`
  );
  ws.onmessage = msgHandler;
};

const msgCb: {
  type: string;
  cb: (_: any) => any;
}[] = [];

function msgHandler(e: MessageEvent) {
  let data: any;
  let type: string;

  try {
    const json = JSON.parse(e.data);
    data = json.data;
    type = json.type;
  } catch {
    return;
  }
  if (data !== undefined || data !== null) {
    msgCb.forEach((job) => {
      // ws?.removeEventListener("message", callback);
      if (job.type === type) {
        job.cb(data);
      }
    });
  }
}

export const addListener = <T>(type: string, cb: (_: T) => any) => {
  msgCb.push({ type, cb });
};

type msgType = "move" | "config" | "acquire" | "release";
export const sendMsg = (data: { type: msgType; msg?: any }) => {
  ws?.send(JSON.stringify(data));
};
