"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runSearch_1 = __importDefault(require("./runSearch"));
const CommandMeta_1 = require("./CommandMeta");
function runListen(graph, step) {
    if (step.flags.get) {
        const search = step.toRelationSearch();
        search.finish = () => null;
        runSearch_1.default(graph, search);
    }
    graph.addListener(step.pattern, {
        onRelationUpdated(rel) {
            step.output.relation(rel);
        },
        onRelationDeleted(rel) {
            CommandMeta_1.emitRelationDeleted(rel, step.output);
        }
    });
}
exports.default = runListen;
//# sourceMappingURL=runListen.js.map