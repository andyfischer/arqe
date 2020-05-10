"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const Graph_1 = __importDefault(require("../../Graph"));
const testCode = `
function f() {
    const a = 1 + 2;
    console.log(a);
}
`;
describe('parseSourceIntoGraph', () => {
    it("works", () => {
        const graph = new Graph_1.default();
        __1.parseSourceIntoGraph(graph, testCode);
        // No parse errors
        expect(graph.runSync('get parseerror/*')).toEqual([]);
    });
});
