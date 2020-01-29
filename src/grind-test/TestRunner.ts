
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

    run = (command, opts?: RunOptions): Promise<string> => {

        const { graph } = this;
        const allowError = opts && opts.allowError;

        if (this.chaosMode && this.chaosMode.modifyRunCommand)
            command = this.chaosMode.modifyRunCommand(command);

        const verifier = verifyRespondProtocol(command, (err) => {
            fail(`Protocol error: ${err.problem} (${JSON.stringify({ causedBy: err.causedBy })})`);
        });

        return new Promise((resolve, reject) => {
            const collector = collectRespond(resolve);

            graph.run(command, msg => {
                if (msg && msg.startsWith('#error') && !allowError) {
                    reject(msg);
                }

                verifier(msg);
                collector(msg);
            });
        });
    }
}
