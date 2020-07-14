import Graph from "../Graph";
import setupInMemoryObjectTable from "../virtualTables/InMemoryObject";
import parseTuple from "../parseTuple";
import { run } from './utils'

it('can correctly read from InMemoryObject table', () => {
    const graph = new Graph();
    const { object, table } = setupInMemoryObjectTable({ primaryKey: parseTuple('imo/1') });

    object.a = '1';
    object.b = '2';
    graph.addTable(table);

    expect(run(graph, 'get imo/1 attr value')).toEqual(['imo/1 attr/a value/1', 'imo/1 attr/b value/2']);
    expect(run(graph, 'get imo/1 attr/a')).toEqual(['imo/1 attr/a value/1']);
})
