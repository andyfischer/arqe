
import Tuple from '../Tuple'
import Graph from '../Graph'
import findTableForQuery from '../findTableForQuery'
import { receiveToTupleList } from '../receiveUtils'
import { parsePattern } from '../parseCommand'

const graph = new Graph();
const table1 = graph.defineInMemoryTable("table1", parsePattern("table1"));
const table2 = graph.defineInMemoryTable("table2", parsePattern("table2 main b? c?"));
const table2alt = graph.defineInMemoryTable("table2alt", parsePattern("table2 alt b? c?"));

it('uses explicit table if provided', () => {
    const tuple = parsePattern('table(table1)');
    expect(findTableForQuery(graph, tuple)).toEqual(table1);
});

it(`errors if the table doesn't exist`, () => {
    const tuple = parsePattern('table(tableX)');
    let output: Tuple[] = [];
    const receiver = { next(r) { output.push(r) }, done() {} };

    expect(() => {
        findTableForQuery(graph, tuple);
    }).toThrow();
});

it(`finds a defined table`, () => {
    expect(findTableForQuery(graph, parsePattern('table2 main b(1)'))).toEqual(table2);
    expect(findTableForQuery(graph, parsePattern('table2 main'))).toEqual(table2);
    expect(findTableForQuery(graph, parsePattern('table2 main b c'))).toEqual(table2);
    expect(findTableForQuery(graph, parsePattern('table2 main b c d'))).not.toEqual(table2);
    expect(findTableForQuery(graph, parsePattern('table2 alt b c'))).toEqual(table2alt);

});
