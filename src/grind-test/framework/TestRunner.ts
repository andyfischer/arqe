
import TestSuite from './TestSuite'
import collectRespond from '../../collectRespond'
import verifyRespondProtocol from '../../verifyRespondProtocol'
import Graph, { RunFunc } from '../../Graph'
import { connectToServer } from '../../socket/CommandConnection'

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
    runFunc: RunFunc

    constructor(suite: TestSuite, chaosMode?: ChaosMode) {
        this.suite = suite;
        this.chaosMode = chaosMode;

        this.setup();
    }

    setup() {
        if (process.env.REMOTE_HOST) {
            const connection = connectToServer(process.env.REMOTE_HOST);
            this.runFunc = (m,r) => connection.run(m,r);
            return;
        }

        const graph = new Graph();

        if (this.chaosMode && this.chaosMode.setupNewGraph) {
            this.chaosMode.setupNewGraph(graph);
        }

        this.runFunc = (m,r) => graph.run(m,r);
    }

    run = (command, opts?: RunOptions): Promise<string> => {

        const runFunc = this.runFunc;
        const allowError = opts && opts.allowError;

        if (this.chaosMode && this.chaosMode.modifyRunCommand)
            command = this.chaosMode.modifyRunCommand(command);

        const verifier = verifyRespondProtocol(command, (err) => {
            fail(`Protocol error: ${err.problem} (${JSON.stringify({ causedBy: err.causedBy })})`);
        });

        return new Promise((resolve, reject) => {
            const collector = collectRespond(resolve);

            runFunc(command, msg => {
                if (msg && msg.startsWith('#error') && !allowError) {
                    reject(msg);
                }

                verifier(msg);
                collector(msg);
            });
        });
    }
}
