
import Graph from '../Graph'

it('handles none found', () => {
    const graph = new Graph();
    expect(graph.find('a/1 b/*')).toEqual([]);
});

it('handles one found', () => {
    const graph = new Graph();
    graph.insert('a/1 b/2', 'the value');
    expect(graph.findAsObject('a/1 b/*')).toEqual({
        '2': 'the value'
    });
});

it('handles two found', () => {
    const graph = new Graph();
    graph.insert('a/1 b/2', 'the value');
    graph.insert('a/1 b/3', 'the other value');
    expect(graph.findAsObject('a/1 b/*')).toEqual({
        '2': 'the value',
        '3': 'the other value'
    });
});

it("doesn't give results for wrong starTag", () => {
    const graph = new Graph();
    graph.insert('a/1 b/2', 'the value');
    graph.insert('a/1 b/3', 'the other value');
    expect(graph.findAsObject('a/1 c/*')).toEqual({});
});

it("doesn't give results for triples", () => {
    const graph = new Graph();
    graph.insert('a/1 b/2 c/3', 'the value');
    expect(graph.findAsObject('a/1 b/*')).toEqual({});
    expect(graph.findAsObject('a/1 c/*')).toEqual({});
});

it("doesn't give results for singles", () => {
    const graph = new Graph();
    graph.insert('a/1', 'the value');
    expect(graph.findAsObject('a/1 b/*')).toEqual({});
});

it("works correctly when a search has been done before the insert", () => {
    const graph = new Graph();
    graph.insert('a/1', 'one');
    expect(graph.findAsObject('a/*')).toEqual({'1': 'one'});
    graph.insert('a/2', 'two');
    expect(graph.findAsObject('a/*')).toEqual({'1': 'one', '2': 'two'});
});

it("works correctly when a search has been done before a delete", () => {
    const graph = new Graph();
    graph.insert('a/1', 'one');
    expect(graph.findAsObject('a/*')).toEqual({'1': 'one'});
    graph.del('a/1');
    expect(graph.find('a/*')).toEqual([]);
});
