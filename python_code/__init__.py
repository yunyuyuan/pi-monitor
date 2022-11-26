from aiohttp import web, web_request
import aiohttp
import asyncio
from .camera import Camera

class WebServer(object):
    def __init__(self, port=8088):
        self.camera = Camera()
        self.app = web.Application()
        self.port = port
    
    def start(self):
        self.app.add_routes([
            web.get('/', self.index),
            web.get('/stream', self.camera.gen_stream),
            web.get('/ws', self.websocket_handler),
        ])
        self.app.on_shutdown.append(lambda app: self.camera.destroy())
        web.run_app(self.app, host='localhost', port=self.port)
        # runner = web.AppRunner(self.app)
        
        # loop = asyncio.new_event_loop()
        # asyncio.set_event_loop(loop)
        # loop.run_until_complete(runner.setup())
        # site = web.TCPSite(runner, 'localhost', self.port)
        # loop.run_until_complete(site.start())
        # loop.run_forever()

    async def index(self, request: web_request.Request):
        # <img src="stream" width="640" height="480" />
        return web.Response(text='''<!DOCTYPE html>
            <html>
            <head>
            <title>picamera MJPEG streaming demo</title>
            </head>
            <body>
            <h1>PiCamera MJPEG Streaming Demo</h1>
            <script>
                var sock = new WebSocket('ws://' + window.location.host + '/ws');
                sock.onmessage = function(event) {
                    console.log(event)
                };
                let i = 1;
                setInterval(() => {
                    sock.send(i.toString())
                    i += 1;
                }, 1000)
            </script>
            </body>
            </html>''', content_type='text/html')
    
    async def websocket_handler(self, request: web_request.Request):
        ws = web.WebSocketResponse()
        await ws.prepare(request)

        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                if msg.data == 'close':
                    await ws.close()
                else:
                    await ws.send_str(msg.data + '/answer')
            elif msg.type == aiohttp.WSMsgType.ERROR:
                print('ws connection closed with exception %s' %
                      ws.exception())

        print('websocket connection closed')

        return ws