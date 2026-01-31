import { Application } from 'express';
import { Server as SocketIOServer } from 'socket.io';
declare const app: Application;
declare const io: SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { io };
export default app;
//# sourceMappingURL=server.d.ts.map