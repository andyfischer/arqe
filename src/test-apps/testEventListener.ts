
import Graph from '../Graph'
import runStandardProcess from '../toollib/runStandardProcess'
import API from './TestEventHandlerAPI'

runStandardProcess(async (graph: Graph) => {
    const api = new API(graph);

    api.eventListener(evt => {
        console.log('received: ', evt);
    });

    await new Promise(() => {});
});
