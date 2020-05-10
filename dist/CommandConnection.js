"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class CommandConnection {
    constructor(ws) {
        this.nextReqId = 1;
        this.reqListeners = {};
        this.ws = ws;
        ws.on('message', str => {
            const { reqid, result, more } = JSON.parse(str);
            const listener = this.reqListeners[reqid];
            if (!listener) {
                console.log('CommandConnection internal error: unrecognized reqid: ' + str);
                return;
            }
            if (result)
                listener.receivePart(result);
            if (!more) {
                listener.receiveEnd();
                delete this.reqListeners[reqid];
            }
        });
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ws.terminate();
        });
    }
    _runWithListener(command, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqid = this.nextReqId;
            this.nextReqId += 1;
            this.ws.send(JSON.stringify({ reqid, command }));
            this.reqListeners[reqid] = listener;
        });
    }
    run(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = [];
            return new Promise((resolve, reject) => {
                this._runWithListener(command, {
                    receivePart: (msg) => { lines.push(msg); },
                    receiveEnd: () => resolve(lines.join('\n'))
                });
            });
        });
    }
}
exports.default = CommandConnection;
//# sourceMappingURL=CommandConnection.js.map