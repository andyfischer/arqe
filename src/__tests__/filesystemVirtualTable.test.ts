
import Graph from '../Graph'
import path from 'path'

it(`can read files using 'fs' virtual table`, async () => {
    const graph = new Graph();
    const rootDir = path.join(__dirname, '../..');

    const contents = await graph.runAsync('get fs dir(${rootDir}/src/sample-files filename | order-by filename');

});
