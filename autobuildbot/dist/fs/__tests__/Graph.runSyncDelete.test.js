"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
it('works when using "delete" in runSync', () => {
    const graph = new Graph_1.default();
    graph.runSync('set a b/1');
    graph.runSync('delete a b/*');
});
//# sourceMappingURL=Graph.runSyncDelete.test.js.map