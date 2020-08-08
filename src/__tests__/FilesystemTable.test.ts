import Graph from "../Graph";
import path from 'path'
import { setupTables } from '../tables/Filesystem'

let graph: Graph;

beforeEach(() => {
    graph = new Graph({autoinitMemoryTables: false});
    graph.addTables(setupTables())
})

it('supports file reading', async () => {
    const filename = path.join(__dirname, 'sampleFiles/file1.txt');
    const q = graph.query(`fs filename(${filename}) file-contents`);
    const result = await q.getRelationAsync();
    expect(result.tuples[0].getVal('file-contents')).toEqual('this is file one\n');
})

it('supports file saving', () => {

})

it('supports file deleting', () => {

})