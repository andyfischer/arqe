import Graph from "../Graph";
import setupInMemoryObjectTable from "../tables/InMemoryObject";
import parseTuple from "../parseTuple";
import { run } from './utils'

it('can correctly read from InMemoryObject table', () => {
    const graph = new Graph();
    const { map, table } = setupInMemoryObjectTable({ baseKey: parseTuple('imo/1') });

    map.set('a', '1')
    map.set('b', '2');
    graph.addTable(table);

    expect(table.schema.stringify()).toEqual('imo/1 key value');
    expect(run(graph, 'get imo/1 key value')).toEqual(['imo/1 key/a value/1', 'imo/1 key/b value/2']);
    expect(run(graph, 'get imo/1 key/a')).toEqual(['imo/1 key/a value/1']);
})
