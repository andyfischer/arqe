
import Graph from '../../Graph'
import TestRunner from './TestRunner'

import { ReparseCommand, InsertExtraTag, GetInheritedBranch } from './ChaosModes'

export default class TestSuite {
    testRunners: TestRunner[] = []

    constructor() {
        this.testRunners.push(new TestRunner(this))

        if (!process.env.MIN_CHAOS) {
            this.testRunners.push(new TestRunner(this, ReparseCommand));
            this.testRunners.push(new TestRunner(this, InsertExtraTag));
            // this.testRunners.push(new TestRunner(this, GetInheritedBranch));
        }
    }

    describe(name: string, impl: (context?: any) => void | Promise<any>) {
        describe(name, () => impl(this));
    }

    test = (name: string, impl: (context?: any) => void | Promise<any>) => {

        // TODO create a new GraphContext for each test.
        // const context = new GraphContext();
        
        for (const runner of this.testRunners) {

            let testName = name; 

            if (runner.chaosMode) {
                testName += ` (${runner.chaosMode.shortDescription})`;
            }

            const runFunc = runner.run;
            runFunc['chaosMode'] = runner.chaosMode;

            it(testName, () => impl({
                run: runFunc
            }));
        }
    }
}

export function startSuite() {
    return new TestSuite();
}
