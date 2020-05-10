"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graph_1 = __importDefault(require("../Graph"));
let graph;
let run;
beforeEach(() => {
    graph = new Graph_1.default();
    run = (command) => graph.runSync(command);
});
it('correctly saves', () => {
    run('set a/1');
    const result = run('get a/1');
    expect(result).toEqual('#exists');
});
it("returns correct results for star values", () => {
    run("set a/1 b/1");
    run("set a/2 b/1");
    run("set a/3 b/2");
    expect(run("get a/* b/1")).toEqual(['a/1', 'a/2']);
    expect(run("get a/* b/2")).toEqual(['a/3']);
});
it(`"get *" skips relations with fewer tags`, () => {
    run('set a/1');
    run('set a/1 b/1 c == 1');
    expect(run('get a/1 *')).toEqual(['b/1 c == 1']);
    expect(run('get a/1 b/1 *')).toEqual(['c == 1']);
    expect(run('get a/1 b/1 c *')).toEqual([]);
});
it(`"get *" returns all nearby tags`, () => {
    run('set a 1');
    expect(run('get *')).toEqual(['a 1']);
});
//# sourceMappingURL=Graph.test.js.map