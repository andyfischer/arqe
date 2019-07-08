
import { Graph, runStandardProcess2 } from './fs'

runStandardProcess2('jsfixer', async (graph: Graph, api) => {

    const filename = await api.getCliInput('file');

    console.log('filename: ', filename);

    // TODO- the (set) expression should create the row if needed

    // load the file
    // parse with esprima
    // load all the active fixes
    // apply fixes to AST
    // stringify
    // save
});
