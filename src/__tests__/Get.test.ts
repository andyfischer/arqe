
import { run } from './utils'
import { Graph } from '..';

test('empty get works', () => {
    const graph = new Graph();
    expect(run(graph, 'get')).toEqual([]);
});

it("passes through rows from input", () => {
    const graph = new Graph();
    run(graph, "set a v/1");
    run(graph, "set a v/2");
    run(graph, "set b v/3");
    expect(run(graph, 'get a v | get b v')).toEqual([
        "a v/1",
        "a v/2",
        "b v/3"
    ]);
});