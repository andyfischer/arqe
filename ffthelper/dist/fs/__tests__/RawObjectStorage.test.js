"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const RawObjectStorage_1 = __importDefault(require("../RawObjectStorage"));
let graph;
let linkPattern;
let storage;
beforeEach(() => {
    graph = new Graph_1.default();
    linkPattern = graph.relationPattern("listen objectmount/123 option/*");
    storage = new RawObjectStorage_1.default(linkPattern);
});
function iteratorToList(it) {
    const out = [];
    for (const item of it)
        out.push(item);
    return out;
}
function search(command) {
    const pattern = graph.relationPattern(command);
    return iteratorToList(storage.findAllMatches(pattern))
        .map(rel => rel.stringifyToCommand(graph.schema));
}
it('findAllMatches works with fixed key', () => {
    expect(search("get objectmount/123 .testkey")).toEqual([]);
    storage.value.testkey = 'testval';
    expect(search("get objectmount/123 .testkey")).toEqual([
        'set objectmount/123 .testkey == testval'
    ]);
    storage.value.testkey2 = 'testval2';
    expect(search("get objectmount/123 .testkey")).toEqual([
        'set objectmount/123 .testkey == testval'
    ]);
    expect(search("get objectmount/123 .testkey2")).toEqual([
        'set objectmount/123 .testkey2 == testval2'
    ]);
});
it('findAllMatches works with star key', () => {
    expect(search("get objectmount/123 option/*")).toEqual([]);
    storage.value.testkey = 'testval';
    expect(search("get objectmount/123 option/*")).toEqual([
        'set objectmount/123 .testkey == testval'
    ]);
    storage.value.testkey2 = 'testval2';
    expect(search("get objectmount/123 option/*")).toEqual([
        'set objectmount/123 .testkey == testval',
        'set objectmount/123 .testkey2 == testval2'
    ]);
    delete storage.value.testkey;
    expect(search("get objectmount/123 option/*")).toEqual([
        'set objectmount/123 .testkey2 == testval2'
    ]);
});
it("test when mounted in a graph", () => {
    const graph = new Graph_1.default();
    // graph.installStorage(
});
