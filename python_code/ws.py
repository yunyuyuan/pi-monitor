from typing import Set, Mapping
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        print(len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: Mapping, excloud = set()):
        for connection in self.active_connections.difference(excloud):
            await connection.send_json(message)


