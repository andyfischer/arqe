
import Graph from '../Graph'
import TupleStore from '../TupleStore'
import { parsePattern } from '..'

describe("findTable", () => {
    it('correctly finds primary keys', () => {
        const graph = new Graph();
        const store = graph.tupleStore;

        const abTable = store.defineInMemoryTable('a_b', parsePattern("a b?"))
        const acTable = store.defineInMemoryTable('a_c', parsePattern("a c?"))
        const dTable = store.defineInMemoryTable('d', parsePattern("d"))


    });
})
