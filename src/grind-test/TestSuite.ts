
import Graph from '../Graph'
import verifyRespondProtocol from '../verifyRespondProtocol'
import collectRespond from '../collectRespond'

let _graph: Graph;

function initializeGraph() {
    const graph = new Graph();
    _graph = graph;
    return graph;
}

export default class TestSuite {
    graph: Graph

    constructor() {
        this.graph = new Graph();
    }

    onRun(command: string) {
        // test parse & stringify.
        // test with added extra tags.
        return command;
    }

    describe(name: string, impl: (suite?: TestSuite) => void | Promise<any>) {
        describe(name, () => impl(this));
    }

    test = (name: string, impl: (suite?: TestSuite) => void | Promise<any>) => {

        // create a new GraphContext for each test.

        it(name, () => impl(this));
    }

    run = (command) => {
        const { graph } = this;

        command = this.onRun(command);

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

        // Didn't finish synchronously, so turn this into a Promise.
        return new Promise(r => { resolveResponse = r; });
    }
}

export function startSuite() {
    return new TestSuite();
}
