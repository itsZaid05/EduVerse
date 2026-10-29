import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { ClassRoom } from "./rooms/ClassRoom";

const port = Number(process.env.PORT || 2567);
const app = express();
app.use(cors()); app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true, service: "eduverse-server" }));

const httpServer = http.createServer(app);
const gameServer = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
// One logical room per class code: students/teachers with the same code share a session.
gameServer.define("classroom", ClassRoom).filterBy(["code"]);
gameServer.listen(port).then(() => console.log(`EduVerse server listening on :${port}`));
