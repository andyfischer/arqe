"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
it(`returns correct results when using 'get' with a named parameter`, () => {
    const graph = new Graph_1.default();
    graph.runSync('set spreadsheet-view/1 input-mode/normal');
    const result = graph.runCommandChainSync('get spreadsheet-view/1 input-mode/$m')
        .filter(rel => !rel.hasType('command-meta'));
    expect(result[0].stringify()).toEqual('spreadsheet-view/1 input-mode/normal');
});
//# sourceMappingURL=Query.namedParameter.test.js.map