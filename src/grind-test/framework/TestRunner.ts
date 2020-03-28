
import TestSuite from './TestSuite'
import collectRespond from '../../collectRespond'
import verifyRespondProtocol from '../../verifyRespondProtocol'
import Graph, { RunFunc } from '../../Graph'
import { connectToServer } from '../../socket/CommandConnection'
import ChaosMode from './ChaosMode'
import runCommand from './runCommand'

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
        return runCommand(command, {
            runFunc: this.runFunc,
            chaosMode: this.chaosMode,
            ...opts
        });
    }
}
