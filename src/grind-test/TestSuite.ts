
import Graph from '../Graph'
import ChaosFlags from './ChaosFlags'
import TestRunner from './TestRunner'

export default class TestSuite {
    testRunners: TestRunner[] = []

    constructor() {
        this.testRunners.push(new TestRunner(this))
        this.testRunners.push(new TestRunner(this, { reparseCommand: true }, "reparse command" ))
    }

    describe(name: string, impl: (context?: any) => void | Promise<any>) {
        describe(name, () => impl(this));
    }

    test = (name: string, impl: (context?: any) => void | Promise<any>) => {

        // TODO create a new GraphContext for each test.
        // const context = new GraphContext();
        
        for (const runner of this.testRunners) {

            let testName = name; 

            if (runner.shortDescription) {
                testName += ` (${runner.shortDescription})`;
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
