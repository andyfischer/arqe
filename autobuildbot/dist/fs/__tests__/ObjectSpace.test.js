"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
xit('setting object-type creates an object column', () => {
    const graph = new Graph_1.default();
    expect(graph.objectTypes.columns.size).toEqual(0);
    graph.run('set object-type/ot');
    expect(graph.objectTypes.columns.size).toEqual(1);
    expect(graph.objectTypes.column('ot')).toBeDefined();
});
//# sourceMappingURL=ObjectSpace.test.js.map