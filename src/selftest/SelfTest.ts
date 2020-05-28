
import Graph from '../Graph'
import { parsedCommandToString } from '../stringifyQuery'
import parseCommand from '../parseCommand'

import SelfTestProvider from './generated/SelfTestProvider'
import SelfTestConsumer from './generated/SelfTestConsumer'

interface TestResult {
    description: string
    resultMessage: string
    passed: boolean
}

function oneRestringifyTest(exampleQuery: string) {
    const description = 'restringify: ' + exampleQuery;
    const restringified = parsedCommandToString(parseCommand(exampleQuery))
    
    if (restringified === exampleQuery)
        return { description, resultMessage: '', passed: true }

    return { description, resultMessage: 'saw: ' + restringified, passed: false }
}

export function restringifyTests(api: SelfTestConsumer): TestResult[] {
    const results: TestResult[] = [];

    /*
    for (const exampleQuery of api.listQueryTestExamples()) {
        results.push(oneRestringifyTest(exampleQuery));
    }
    */

    return results;
}

export default function setup(graph: Graph) {
    const api = new SelfTestConsumer(graph);

    return new SelfTestProvider({
        selfTestResults() {
            const results = []
                .concat(restringifyTests(api));

            return results;
        }
    })
}
