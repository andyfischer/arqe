import { Graph } from ".."
import { run } from "./utils";

let graph: Graph;

beforeEach(() => {
    graph = new Graph();
})

it('strips attrs', () => {
    run(graph, 'set a b c/1');
    run(graph, 'set a b c/2');
    run(graph, 'set a b c/3');
    
    expect(run(graph, 'get a b c | just c')).toEqual(['c/1', 'c/2', 'c/3'])
    expect(run(graph, 'get a b c | just b c')).toEqual(['b c/1', 'b c/2', 'b c/3'])
})

it(`doesn't include empty tuples`, () => {

    run(graph, 'set a b/1 c/1');
    run(graph, 'set a b/2');
    
    expect(run(graph, 'get a b c?')).toEqual(['a b/1 c/1', 'a b/2']);
    expect(run(graph, 'get a b c | just c')).toEqual(['c/1'])
})