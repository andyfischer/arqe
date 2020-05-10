import TestSuite from './TestSuite';
import { ChaosMode } from './ChaosModes';
import Runnable from '../../Runnable';
interface RunOptions {
    allowError?: true;
}
export default class TestRunner {
    suite: TestSuite;
    chaosMode?: ChaosMode;
    graph: Runnable;
    constructor(suite: TestSuite, chaosMode?: ChaosMode);
    setup(): void;
    run: (command: any, opts?: RunOptions) => Promise<string | string[]>;
}
export {};
