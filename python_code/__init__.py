from typing import Union
import fastapi
from os import path
import io
from threading import Condition
from fastapi.responses import StreamingResponse, RedirectResponse, HTMLResponse
from fastapi import FastAPI, WebSocket
import uuid
import picamera
import uvicorn
from python_code.steer import Steer
from dotenv import dotenv_values

from python_code.ws import ConnectionManager

env = dotenv_values(path.join(path.dirname(__file__), "../.env"))

steer = Steer()
app = FastAPI()
camera: picamera.PiCamera
current: Union[None, uuid.UUID] = None


@app.on_event("shutdown")
async def startup_event():
    if camera:
        camera.stop_recording()
    if steer:
        steer.destroy()

class StreamingOutput(object):
    def __init__(self):
        self.frame: bytes
        self.buffer = io.BytesIO()
        self.condition = Condition()

    def write(self, buf):
        if buf.startswith(b'\xff\xd8'):
            # New frame, copy the existing buffer's content and notify all
            # clients it's available
            self.buffer.truncate()
            with self.condition:
                self.frame = self.buffer.getvalue()
                self.condition.notify_all()
            self.buffer.seek(0)
        return self.buffer.write(buf)

output: StreamingOutput

def check_pwd(pwd):
    if pwd != env['VITE_PWD']:
        return HTMLResponse(content='403 forbiddent', status_code=403)
    return None

@app.get("/")
def read_root():
    return RedirectResponse(url='/web')

@app.get("/stream/{pwd}")
async def stream(pwd, background_tasks: fastapi.background.BackgroundTasks):
    check = check_pwd(pwd)
    if check:
        return check
    def streamer():
        while True:
            with output.condition:
                output.condition.wait()
                frame = output.frame
                yield (b'--FRAME\r\n' + b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    g = streamer()
    background_tasks.add_task(lambda g: g.close(), g)
    return StreamingResponse(g, media_type="multipart/x-mixed-replace;boundary=FRAME")

ws_manager = ConnectionManager()

@app.websocket('/ws/{pwd}')
async def ws_handler(pwd, websocket: WebSocket):
    global camera, output, current
    check = check_pwd(pwd)
    if check:
        return check

    await ws_manager.connect(websocket)
    uid = uuid.uuid4()
    await websocket.send_json({
        'type': 'config',
        'data': {
            'framterate': int(camera.framerate),
            'resolution': 'x'.join(map(str, camera.resolution)),
            'x_duty': steer.x_duty,
            'y_duty': steer.y_duty,
        }
    })
    await websocket.send_json({
        'type': 'edit',
        'data': current == None
    })
    async def release():
        global current
        current = None
        await ws_manager.broadcast({
            'type': 'edit',
            'data': True
        })
        await websocket.send_json({
            'type': 'editing',
            'data': False
        })
    try:
        while True:
            data = await websocket.receive_json()
            if data:
                if data['type'] == 'acquire':
                    if not current:
                        current = uid
                        await ws_manager.broadcast({
                            'type': 'edit',
                            'data': False
                        })
                        await websocket.send_json({
                            'type': 'editing',
                            'data': True
                        })
                elif data['type'] == 'release':
                    if current == uid:
                        await release()
                elif uid == current:
                    msg = data['msg']
                    if data['type'] == 'move':
                        steer.move(orient=msg['orient'], duty=msg['duty'])
                    elif data['type'] == 'config':
                        if msg['key'] == 'framerate':
                            camera.stop_recording()
                            camera.framerate = max(1, min(120, int(msg['value'])))
                            camera.start_recording(output, format='mjpeg')
                        elif msg['key'] == 'resolution':
                            camera.stop_recording()
                            camera.resolution = msg['value']
                            camera.start_recording(output, format='mjpeg')
    except:
        try:
            await websocket.close()
        except:
            pass
        ws_manager.disconnect(websocket)
        if current == uid:
            await release()

def start():
    global output, camera
    with picamera.PiCamera(resolution='640x480', framerate=30) as camera:
        output = StreamingOutput()
        camera.start_recording(output, format='mjpeg')
        uvicorn.run(app, port=8099, host='0.0.0.0')