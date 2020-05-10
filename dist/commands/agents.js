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
const clientApi_1 = require("../agents/clientApi");
function default_1(snapshot) {
    snapshot.implement('list-agents', (query) => __awaiter(this, void 0, void 0, function* () {
        const data = yield clientApi_1.getAgents(query.snapshot);
        query.respond({
            type: 'agent[]',
            terminalFormat: 'table',
            items: data
        });
    }));
    snapshot.implement('list-services', (query) => __awaiter(this, void 0, void 0, function* () {
        const data = yield clientApi_1.getServices(query.snapshot);
        query.respond({
            body: data
        });
    }));
}
exports.default = default_1;
//# sourceMappingURL=agents.js.map