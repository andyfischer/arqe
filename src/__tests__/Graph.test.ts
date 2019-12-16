
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
