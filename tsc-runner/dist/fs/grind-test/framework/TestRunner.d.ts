import TestSuite from './TestSuite';
import { RunFunc } from '../../Graph';
import ChaosMode from './ChaosMode';
interface RunOptions {
    allowError?: true;
}
export default class TestRunner {
    suite: TestSuite;
    chaosMode?: ChaosMode;
    runFunc: RunFunc;
    constructor(suite: TestSuite, chaosMode?: ChaosMode);
    setup(): void;
    run: (command: any, opts?: RunOptions) => Promise<string>;
}
export {};
