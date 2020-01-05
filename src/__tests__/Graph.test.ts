
import Graph from '../Graph'

let graph;
let run;

beforeEach(() => {
    graph = new Graph();

    run = (command: string) => graph.runSync(command);
});

it('correctly saves', () => {
    run('set a/1');
    const result = run('get a/1');
    expect(result).toEqual('#exists');
});

it('correctly deletes', () => {
    run('set a/1');
    run('delete a/1');
    const result = run('get a/1');
    expect(result).toEqual('#null');
});

it('returns correct data for "get *"', () => {
    run('set a 1');
    const result = run('get *');
    expect(result).toEqual('[a 1]');
});

it('returns correct data for "get -x"', () => {
    run('set a');
    let result = run('get -x a');
    expect(result).toEqual('set a');

    run('set a == 1');
    result = run('get -x a');
    expect(result).toEqual('set a == 1');
});

it('returns correct data when inherit tags are used', () => {
    run('set typeinfo/branch .inherits')
    run('set typeinfo/testcase .inherits')
    run('set a == 1');
    expect(run('get a')).toEqual('1')
    expect(run('get branch/a a')).toEqual('1')
    expect(run('get testcase/a a')).toEqual('1')
    expect(run('get testcase/a branch/a a')).toEqual('1')
});

it("returns correct results for star values", () => {
    run("set a/1 b/1");
    run("set a/2 b/1");
    run("set a/3 b/2");
    expect(run("get a/* b/1")).toEqual("[a/1, a/2]");
    expect(run("get a/* b/2")).toEqual("[a/3]");
});

it(`"get *" skips relations with fewer tags`, () => {
    run('set a/1')
    run('set a/1 b/1 c == 1')
    expect(run('get a/1 *')).toEqual('[b/1 c == 1]');
    expect(run('get a/1 b/1 *')).toEqual('[c == 1]');
    expect(run('get a/1 b/1 c *')).toEqual('[]');
});

it(`"get *" returns all nearby tags`, () => {
    run('set a 1')
    expect(run('get *')).toEqual('[a 1]');
});
