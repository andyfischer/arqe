"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const GraphContext_1 = __importDefault(require("../GraphContext"));
const stringifyQuery_1 = require("../stringifyQuery");
const collectRespond_1 = __importStar(require("../collectRespond"));
let graph;
let context;
let graphCalls;
async function runCommand(str) {
    return new Promise(resolve => {
        const collector = collectRespond_1.default(resolve);
        context.run(str, collector);
    });
}
function preHook(object, funcName, callback) {
    const orig = object[funcName];
    object[funcName] = function () {
        const args = Array.from(arguments);
        callback.apply(null, args);
        return orig.apply(object, args);
    };
}
beforeEach(() => {
    graph = new Graph_1.default();
    preHook(graph, 'runCommandParsed', (command) => {
        const str = stringifyQuery_1.parsedCommandToString(command);
        graphCalls.push(str);
    });
    context = new GraphContext_1.default(graph);
    graphCalls = [];
});
it("passes commands on to the graph", async () => {
    const response = await runCommand('get 1');
    expect(graphCalls).toEqual(['get 1']);
});
it("includes context fields", async () => {
    await runCommand('context branch/1');
    const response = await runCommand('get 1');
    expect(graphCalls).toEqual(['get 1 branch/1']);
});
it("supports removing context fields", async () => {
    await runCommand('context branch/1');
    await runCommand('context !branch');
    const response = await runCommand('get 1');
    expect(graphCalls).toEqual(['get 1']);
});
it("removes context from 'set' responses", async () => {
    await runCommand('context branch/1');
    let response = await runCommand('set id/#unique');
    expect(graphCalls).toEqual(['set id/#unique branch/1']);
    response = response.replace(/id\/[a-z0-9]*/, 'id/xxx');
    expect(response).toEqual('set id/xxx');
});
it("doesn't echo set if it doesn't need to", async () => {
    let response = await runCommand('set a/1 b/2');
    expect(response).toEqual('#done');
});
describe('Graph.context', () => {
    it('works', () => {
        const cxt = graph.context('cxttest2');
        collectRespond_1.runSync(graph, 'set cxttest2 a == 5');
        expect(collectRespond_1.runSync(cxt, 'get a')).toEqual('5');
    });
});
