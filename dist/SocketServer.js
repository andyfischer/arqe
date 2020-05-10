"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("./Graph"));
const GraphContext_1 = __importDefault(require("./GraphContext"));
const parseCommand_1 = __importDefault(require("./parseCommand"));
const GraphORM_1 = require("./GraphORM");
const logError_1 = __importDefault(require("./logError"));
class ServerSocket {
    constructor(wss, graph) {
        this.graph = graph || new Graph_1.default();
        this.wss = wss;
        this.wss.on('connection', (ws) => {
            const id = GraphORM_1.createUniqueEntity(graph, 'connection');
            const graphContext = new GraphContext_1.default(this.graph);
            graphContext.addOptionalContextTag({ tagType: 'connection', tagValue: id });
            ws.on('message', (str) => __awaiter(this, void 0, void 0, function* () {
                const data = JSON.parse(str);
                const { reqid, command } = data;
                function send(data) {
                    ws.send(JSON.stringify(data));
                }
                try {
                    const parsedCommand = parseCommand_1.default(command);
                    parsedCommand.respond = (result) => {
                        send({ reqid, result });
                    };
                    parsedCommand.respondPart = (result) => {
                        send({ reqid, result, more: true });
                    };
                    parsedCommand.respondEnd = () => {
                        send({ reqid });
                    };
                    yield graphContext.handleCommand(parsedCommand);
                }
                catch (err) {
                    logError_1.default(err);
                    ws.send(JSON.stringify({ reqid, internalError: true, err }));
                }
            }));
            ws.on('close', (str) => __awaiter(this, void 0, void 0, function* () {
                graph.handleCommandStr(`delete connection/${id} *`);
                console.log(`server: closed connection/${id}`);
            }));
        });
    }
}
exports.default = ServerSocket;
//# sourceMappingURL=SocketServer.js.map