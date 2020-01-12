
import Graph from '../Graph'
import verifyRespondProtocol from '../verifyRespondProtocol'
import collectRespond from '../collectRespond'

let _graph: Graph;

function initializeGraph() {
    const graph = new Graph();

    return graph;
}

export function run(command: string) {
    if (!_graph)
        _graph = initializeGraph();

    const graph = _graph;

    const verifier = verifyRespondProtocol(command, (err) => {
        fail(`Protocol error: ${err.problem} (${JSON.stringify({ causedBy: err.causedBy })})`);
    });

    let response;
    let responseFinished = false;
    let resolveResponse;

    const collector = collectRespond(finishedValue => {

        responseFinished = true;

        if (resolveResponse) {
            // Async finish
            resolveResponse(finishedValue);
        } else {
            // Sync finish
            response = finishedValue;
        }
    });

    graph.run(command, msg => {
        verifier(msg);
        collector(msg);
    });

    if (responseFinished)
        return response;

    // Didn't finish synchronously so turn this into a Promise.
    return new Promise(r => { resolveResponse = r; });
}
