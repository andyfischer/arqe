import Graph from "../Graph";
import path from 'path'
import setupTables from '../tables/Filesystem'
import { run } from "./utils";

let graph: Graph;

beforeEach(() => {
    graph = new Graph();
    graph.provide(setupTables())
})

it('supports file reading', async () => {
    const filename = path.join(__dirname, 'sampleFiles/file1.txt');
    const q = graph.newLiveQuery(`get fs filename[${filename}] file-contents`);
    const result = await q.runAsync();
    expect(Array.from(result.body())[0].getVal('file-contents')).toEqual('this is file one\n');
})

it('supports globs', async () => {
    const dir = path.join(__dirname, 'sampleFiles')

    expect((await graph.getRelationAsync(`glob pattern[${dir}/*.txt] filename`))
        .bodyArray().map(t => path.basename(t.getVal('filename')))).toEqual(['file1.txt', 'file2.txt'])

    expect((await graph.getRelationAsync(`glob pattern[${dir}/*.md] filename`))
        .bodyArray().map(t => path.basename(t.getVal('filename')))).toEqual(['file3.md'])

    expect((await graph.getRelationAsync(`glob pattern[${dir}/*] filename`))
        .bodyArray().map(t => path.basename(t.getVal('filename')))).toEqual(['file1.txt', 'file2.txt', 'file3.md'])

    // With 'cwd'
    expect((await graph.getRelationAsync(`glob cwd[${dir}] pattern[*.txt] filename`))
        .bodyArray().map(t => path.basename(t.getVal('filename')))).toEqual(['file1.txt', 'file2.txt'])
})
