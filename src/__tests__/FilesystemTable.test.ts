import Graph from "../Graph";
import path from 'path'
import setupTables from '../tables/Filesystem'
import { run } from "./utils";

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

it('supports globs', async () => {
    const dir = path.join(__dirname, 'sampleFiles')

    expect((await graph.getRelationAsync(`glob pattern(${dir}/*.txt) filename`))
        .tuples.map(t => path.basename(t.getVal('filename')))).toEqual(['file1.txt', 'file2.txt'])

    expect((await graph.getRelationAsync(`glob pattern(${dir}/*.md) filename`))
        .tuples.map(t => path.basename(t.getVal('filename')))).toEqual(['file3.md'])

    expect((await graph.getRelationAsync(`glob pattern(${dir}/*) filename`))
        .tuples.map(t => path.basename(t.getVal('filename')))).toEqual(['file1.txt', 'file2.txt', 'file3.md'])

    // With 'cwd'
    expect((await graph.getRelationAsync(`glob cwd(${dir}) pattern(*.txt) filename`))
        .tuples.map(t => path.basename(t.getVal('filename')))).toEqual(['file1.txt', 'file2.txt'])
})
