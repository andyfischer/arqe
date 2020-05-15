
import TestMathProviderAPI from './generated/TestMathProviderAPI'

export function setupTestMathStorage() {
    return new TestMathProviderAPI({
        sum(a, b) {
            return parseInt(a) + parseInt(b) + '';
        }
    })
}
