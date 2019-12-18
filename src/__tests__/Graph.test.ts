
import Graph from '../Graph'

it('correctly saves', () => {
    const graph = new Graph();
    graph.handleCommandStr('save a/1');
    const result = graph.handleCommandStr('get a/1');
    expect(result).toEqual('#exists');
});

it('correctly deletes', () => {
    const graph = new Graph();
    graph.handleCommandStr('save a/1');
    graph.handleCommandStr('delete a/1');
    const result = graph.handleCommandStr('get a/1');
    expect(result).toEqual('#null');
});

it('returns correct data for "get *"', () => {
    const graph = new Graph();
    graph.handleCommandStr('save a 1');
    const result = graph.handleCommandStr('get *');
    expect(result).toEqual('[a 1]');
});

it('returns correct data for "get -x"', () => {
    const graph = new Graph();
    graph.handleCommandStr('save a');
    let result = graph.handleCommandStr('get -x a');
    expect(result).toEqual('save a');

    graph.handleCommandStr('save a == 1');
    result = graph.handleCommandStr('get -x a');
    expect(result).toEqual('save a == 1');
});

it('returns correct data when inherit tags are used', () => {
    const graph = new Graph();
    graph.handleCommandStr('save typeinfo/branch .inherits')
    graph.handleCommandStr('save typeinfo/testcase .inherits')
    graph.handleCommandStr('save a == 1');
    expect(graph.handleCommandStr('get a')).toEqual('1')
    expect(graph.handleCommandStr('get branch/a a')).toEqual('1')
    expect(graph.handleCommandStr('get testcase/a a')).toEqual('1')
    expect(graph.handleCommandStr('get testcase/a branch/a a')).toEqual('1')
});

it("returns correct results for star values", () => {
    const graph = new Graph();
    graph.handleCommandStr("save a/1 b/1");
    graph.handleCommandStr("save a/2 b/1");
    graph.handleCommandStr("save a/3 b/2");
    expect(graph.handleCommandStr("get a/* b/1")).toEqual("[a/1, a/2]");
    expect(graph.handleCommandStr("get a/* b/2")).toEqual("[a/3]");
});

it(`"get *" skips relations with fewer tags`, () => {
    const graph = new Graph();
    graph.handleCommandStr('save a/1')
    graph.handleCommandStr('save a/1 b/1 c == 1')
    expect(graph.handleCommandStr('get a/1 *')).toEqual('[b/1 c == 1]');
    expect(graph.handleCommandStr('get a/1 b/1 *')).toEqual('[c == 1]');
    expect(graph.handleCommandStr('get a/1 b/1 c *')).toEqual('[]');
});

it(`"get *" returns all nearby tags`, () => {
    const graph = new Graph();
    graph.handleCommandStr('save a 1')
    expect(graph.handleCommandStr('get *')).toEqual('[a 1]');
});
