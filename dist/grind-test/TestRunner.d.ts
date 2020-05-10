import TestSuite from './TestSuite';
import Graph from '../Graph';
export interface ChaosMode {
    shortDescription: string;
    setupNewGraph?: (graph: Graph) => void;
    modifyRunCommand?: (command: string) => string;
}
interface RunOptions {
    allowError?: true;
}
export default class TestRunner {
    suite: TestSuite;
    chaosMode?: ChaosMode;
    graph: Graph;
    constructor(suite: TestSuite, chaosMode?: ChaosMode);
    run: (command: any, opts?: RunOptions) => Promise<string>;
}
export {};
