"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importDefault(require("./parseCommand"));
class SavedQuery {
    constructor(graph, id, queryStr) {
        this.changeToken = 0;
        this.connectedEagerValues = {};
        if (queryStr.startsWith('get '))
            throw new Error("SavedQuery queryStr should not start with 'get': " + queryStr);
        this.graph = graph;
        this.id = id;
        this.queryStr = queryStr;
        this.command = parseCommand_1.default('get ' + queryStr);
        this.pattern = this.command.toPattern();
    }
    connectEagerValue(ev) {
        this.connectedEagerValues[ev.id] = ev;
    }
    updateConnectedValues() {
        for (const id in this.connectedEagerValues)
            this.connectedEagerValues[id].runUpdate();
    }
}
exports.default = SavedQuery;
