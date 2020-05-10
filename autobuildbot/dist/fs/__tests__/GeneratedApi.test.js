"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const GeneratedApi_1 = __importDefault(require("./generated/GeneratedApi"));
let graph;
let api;
beforeAll(() => {
    graph = new Graph_1.default();
    graph.runSync('set a/1 b/1');
    graph.runSync('set a flag/startingval');
    api = new GeneratedApi_1.default(graph);
});
it('supports getting a single tag', () => {
    expect(api.getOneTag()).toEqual('b/1');
});
it('supports getting a single tag value', () => {
    expect(api.getOneTagValue()).toEqual('1');
});
it('supports a delete & set piped query', () => {
    expect(api.getCurrentFlag('a')).toEqual('startingval');
    api.changeFlag('a', 'nextval');
    expect(api.getCurrentFlag('a')).toEqual('nextval');
});
//# sourceMappingURL=GeneratedApi.test.js.map