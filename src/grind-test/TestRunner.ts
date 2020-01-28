
import TestSuite from './TestSuite'
import collectRespond from '../collectRespond'
import verifyRespondProtocol from '../verifyRespondProtocol'
import Graph from '../Graph'

export interface ChaosMode {
    shortDescription: string
    setupNewGraph?: (graph: Graph) => void
    modifyRunCommand?: (command: string) => string
}

interface RunOptions {
    allowError?: true
}

export default class TestRunner {
    suite: TestSuite
    chaosMode?: ChaosMode
    graph: Graph

    constructor(suite: TestSuite, chaosMode?: ChaosMode) {
        this.suite = suite;
        this.graph = new Graph();
        this.chaosMode = chaosMode;

        if (this.chaosMode && this.chaosMode.setupNewGraph) {
            this.chaosMode.setupNewGraph(this.graph);
        }
    }

    run = (command, opts?: RunOptions) => {

        const { graph } = this;
        const allowError = opts && opts.allowError;

        if (this.chaosMode && this.chaosMode.modifyRunCommand)
            command = this.chaosMode.modifyRunCommand(command);

        const verifier = verifyRespondProtocol(command, (err) => {
            fail(`Protocol error: ${err.problem} (${JSON.stringify({ causedBy: err.causedBy })})`);
        });

        let response;
        let responseFinished = false;
        let resolveResponse;
        let rejectResponse;

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

        let error = null;

        graph.run(command, msg => {
            if (!error && msg && msg.startsWith('#error') && !allowError) {
                error = msg;
                if (rejectResponse)
                    rejectResponse(error);
            }

            verifier(msg);
            collector(msg);
        });

        if (error && !allowError)
            throw error;

        if (responseFinished) {
            return response;
        }

        // Didn't finish synchronously, so turn this into a Promise.
        return new Promise((resolve, reject) => {
            resolveResponse = resolve;
            rejectResponse = reject;
        });
    }
}
