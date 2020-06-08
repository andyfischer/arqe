
import Graph from '../Graph'
import TupleStore from '../TupleStore'
import { parsePattern } from '..'

describe("findTable", () => {
    it('correctly finds primary keys', () => {
        const graph = new Graph();
        const store = graph.tupleStore;

        const abTable = store.initTable('a_b')
        const acTable = store.initTable('a_c')
        const dTable = store.initTable('d')

        store.setPrimaryKey(parsePattern('a b'), abTable);
        store.setPrimaryKey(parsePattern('a c'), abTable);
        store.setPrimaryKey(parsePattern('d'), dTable);

    });
})
