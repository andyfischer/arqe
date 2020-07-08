
import Tuple from '../Tuple'
import Graph from '../Graph'
import findTableForQuery from '../findTableForQuery'
import { receiveToTupleList } from '../receiveUtils'
import parseTuple from '../parseTuple';

const graph = new Graph();
const table1 = graph.defineInMemoryTable("table1", parseTuple("table1"));
const table2 = graph.defineInMemoryTable("table2", parseTuple("table2 main b? c?"));
const table2alt = graph.defineInMemoryTable("table2alt", parseTuple("table2 alt b? c?"));

it('uses explicit table if provided', () => {
    const tuple = parseTuple('table(table1)');
    expect(findTableForQuery(graph, tuple)).toEqual(table1);
});

it(`errors if the table doesn't exist`, () => {
    const tuple = parseTuple('table(tableX)');
    let output: Tuple[] = [];
    const receiver = { next(r) { output.push(r) }, done() {} };

    expect(() => {
        findTableForQuery(graph, tuple);
    }).toThrow();
});

it(`finds a defined table`, () => {
    expect(findTableForQuery(graph, parseTuple('table2 main b(1)'))).toEqual(table2);
    expect(findTableForQuery(graph, parseTuple('table2 main'))).toEqual(table2);
    expect(findTableForQuery(graph, parseTuple('table2 main b c'))).toEqual(table2);
    expect(findTableForQuery(graph, parseTuple('table2 main b c d'))).not.toEqual(table2);
    expect(findTableForQuery(graph, parseTuple('table2 alt b c'))).toEqual(table2alt);

});
