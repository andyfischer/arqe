
import { Graph, runStandardProcess2 } from './fs'

runStandardProcess2('jsfixer', async (graph: Graph, api) => {

    const filename = api.getCliInput('filename');

    console.log('filename: ', filename);

    // load the file
    // parse with esprima
    // load all the active fixes
    // apply fixes to AST
    // stringify
    // save
});
