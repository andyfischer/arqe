"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = require("./parseCommand");
class GraphSavedQueryAPI {
    constructor(graph) {
        this.graph = graph;
    }
    func(commandStr, options) {
        return (...inputs) => {
            const command = parseCommand_1.parseCommandChain(commandStr);
        };
    }
    run(s) {
        this.graph.run(s);
    }
}
exports.default = GraphSavedQueryAPI;
