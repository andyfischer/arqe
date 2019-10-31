
import { Scope } from '../scope'
import { RandSource, standardRandSource } from '../rand-source'

interface TestCase {
    commands: string[]
}

interface TestError {
    testCase: TestCase
}

interface TestRequest {
    newScope: () => Scope
    onError: (error: TestError) => void
    randSource?: RandSource
    testCases: TestCase[]
}

export function runTest(req: TestRequest) {
    const scope = req.newScope();
    const rand = req.randSource || standardRandSource();
}

class TestCaseBuilder {
    expectEquals(foundValue, expectValue) {
    }
}
