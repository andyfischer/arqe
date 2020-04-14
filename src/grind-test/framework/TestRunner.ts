
import TestSuite from './TestSuite'
import verifyRespondProtocol from '../../verifyRespondProtocol'
import Graph from '../../Graph'
import { connectToServer } from '../../socket/CommandConnection'
import { ChaosMode } from './ChaosModes'
import runCommand from './runCommand'
import Runnable from '../../Runnable'

interface RunOptions {
    allowError?: true
}

export default class TestRunner {
    suite: TestSuite
    chaosMode?: ChaosMode
    graph: Runnable

    constructor(suite: TestSuite, chaosMode?: ChaosMode) {
        this.suite = suite;
        this.chaosMode = chaosMode;
        this.setup();
    }

    setup() {
        if (process.env.REMOTE_HOST) {
            const connection = connectToServer(process.env.REMOTE_HOST);
            this.graph = connection;
            return;
        }

        const graph = new Graph();

        if (this.chaosMode && this.chaosMode.setupNewGraph) {
            this.chaosMode.setupNewGraph(graph);
        }

        this.graph = graph;
    }

    run = (command, opts?: RunOptions) => {
        return runCommand(command, {
            graph: this.graph,
            chaosMode: this.chaosMode,
            ...opts
        });
    }
}
