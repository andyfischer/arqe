
import Tuple from '../Tuple'
import Graph from '../Graph'
import findTableForQuery from '../findTableForQuery'
import { receiveToTupleList } from '../receiveUtils'
import { parsePattern } from '../parseCommand'

const graph = new Graph();
const table1 = graph.tupleStore.defineTable("table1", parsePattern("table1"));
const table2 = graph.tupleStore.defineTable("table2", parsePattern("table2 main b? c?"));
const table2alt = graph.tupleStore.defineTable("table2alt", parsePattern("table2 alt b? c?"));

function findNoError(tuple: Tuple) {
    let output = [];
    const receiver = { next(r) { output.push(r) }, done() {} };
    const { table, failed } = findTableForQuery(graph, tuple, receiver);
    expect(failed).toBeFalsy();
    expect(output).toEqual([]);
    return table;
}

it('uses explicit table if provided', () => {
    const tuple = parsePattern('table(table1)');
    expect(findNoError(tuple)).toEqual(table1);
});

it(`errors if the table doesn't exist`, () => {
    const tuple = parsePattern('table(tableX)');
    let output: Tuple[] = [];
    const receiver = { next(r) { output.push(r) }, done() {} };
    const { table, failed } = findTableForQuery(graph, tuple, receiver);
    expect(table).toBeFalsy();
    expect(failed).toEqual(true);
    expect(output[0].getVal('message')).toEqual('table not found: tableX')
});

it(`finds a defined table`, () => {
    expect(findNoError(parsePattern('table2 main b(1)'))).toEqual(table2);
    expect(findNoError(parsePattern('table2 main'))).toEqual(table2);
    expect(findNoError(parsePattern('table2 main b c'))).toEqual(table2);
    expect(findNoError(parsePattern('table2 main b c d'))).not.toEqual(table2);
    expect(findNoError(parsePattern('table2 alt b c'))).toEqual(table2alt);

});
