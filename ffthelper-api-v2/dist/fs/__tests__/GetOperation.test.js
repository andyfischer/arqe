"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
const GetOperation_1 = __importDefault(require("../GetOperation"));
const parseCommand_1 = __importDefault(require("../parseCommand"));
it('supports ** to match everything', () => {
    const graph = new Graph_1.default();
    graph.run('set a');
    graph.run('set a b == 4');
    expect(graph.runSync('get **')).toEqual([
        'a',
        'a b == 4'
    ]);
});
it("correctly looks down for inherit tags", () => {
    const graph = new Graph_1.default();
    graph.run('set typeinfo/branch .inherits');
    const sawSearches = [];
    graph.inMemory.runSearch = (get) => {
        sawSearches.push(get.pattern.stringify());
        get.finishSearch();
    };
    const get = new GetOperation_1.default(graph, parseCommand_1.default("get a b branch/1 branch/2"));
    get.outputToStringRespond(s => null);
    get.run();
    expect(get.done).toEqual(true);
    expect(sawSearches).toEqual([
        "a b branch/1 branch/2",
        "a b branch/1",
        "a b"
    ]);
});
it("correctly looks down for multiple inherit tag types", () => {
    const graph = new Graph_1.default();
    graph.run('set typeinfo/a-branch .inherits');
    graph.run('set typeinfo/b-branch .inherits');
    graph.run('set typeinfo/c-branch .inherits');
    graph.run('set typeinfo/d-branch .inherits');
    const sawSearches = [];
    graph.inMemory.runSearch = (get) => {
        sawSearches.push(get.pattern.stringify());
        get.finishSearch();
    };
    const get = new GetOperation_1.default(graph, parseCommand_1.default("get a b a-branch b-branch c-branch/1 d-branch/2 d-branch/3"));
    get.outputToStringRespond(s => null);
    get.run();
    expect(get.done).toEqual(true);
    expect(sawSearches).toEqual([
        "a b a-branch b-branch c-branch/1 d-branch/2 d-branch/3",
        "a b a-branch b-branch c-branch/1 d-branch/2",
        "a b a-branch b-branch c-branch/1",
        "a b a-branch b-branch",
        "a b a-branch",
        "a b",
    ]);
});
