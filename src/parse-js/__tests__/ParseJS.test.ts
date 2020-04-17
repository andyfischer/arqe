
import { parseSourceIntoGraph } from '..'
import Graph from '../../Graph'

const testCode = `
function f() {
    const a = 1 + 2;
    console.log(a);
}
`;

describe('parseSourceIntoGraph', () => {
    it("works", () => {
        const graph = new Graph();
        parseSourceIntoGraph(graph, testCode);

        // No parse errors
        expect(graph.runSyncOld('get parseerror/*')).toEqual([]);
    });
});
