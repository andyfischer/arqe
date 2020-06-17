
import Graph from '../Graph'
import { parsePattern } from '..'

describe("findTable", () => {
    it('correctly finds primary keys', () => {
        const graph = new Graph();

        const abTable = graph.defineInMemoryTable('a_b', parsePattern("a b?"))
        const acTable = graph.defineInMemoryTable('a_c', parsePattern("a c?"))
        const dTable = graph.defineInMemoryTable('d', parsePattern("d"))


    });
})
