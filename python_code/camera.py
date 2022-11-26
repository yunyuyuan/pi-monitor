import io
import picamera
from threading import Condition
from aiohttp import web_request, web, MultipartWriter

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


class Camera(object):
    camera: picamera.PiCamera
    output: StreamingOutput

    def __init__(self, resolution='640x480', framerate=60):
        self.camera = picamera.PiCamera(resolution=resolution, framerate=framerate)
        self.output = StreamingOutput()
        self.camera.start_recording(self.output, format='mjpeg')
    
    async def gen_stream(self, request: web_request.Request):
        boundary = 'FRAME'
        resp = web.StreamResponse(status=200, headers={
            'Age': '0',
            'Cache-Control': 'no-cache, private',
            'Pragma': 'no-cache',
            'Content-Type': f'multipart/x-mixed-replace; boundary={boundary}'
        })
        try:
            await resp.prepare(request)
            while True:
                with self.output.condition:
                    self.output.condition.wait()
                    frame = self.output.frame
                with MultipartWriter('image/jpeg', boundary=boundary) as writer:
                    writer.append(frame, headers={
                        'Content-Type': 'image/jpeg',
                        'Content-Length': str(len(frame))
                    })
                    await writer.write(resp, close_boundary=False)
                await resp.write(b"\r\n")
        except Exception as e:
            await resp.write_eof()
        return resp
    
    async def destroy(self):
        print('Clean camera')
        self.camera.stop_recording()
        self.camera.close()