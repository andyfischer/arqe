
import Graph from '../Graph'
import TestRunner from './TestRunner'

import { ReparseCommand, InsertExtraTag } from './ChaosModes'

export default class TestSuite {
    testRunners: TestRunner[] = []

    constructor() {
        this.testRunners.push(new TestRunner(this))
        this.testRunners.push(new TestRunner(this, ReparseCommand));
        this.testRunners.push(new TestRunner(this, InsertExtraTag));
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

            it(testName, () => impl({
                run: runner.run
            }));
        }
    }
}

export function startSuite() {
    return new TestSuite();
}
