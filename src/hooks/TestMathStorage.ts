
import TestMathStorageAPI from './TestMathStorageAPI'

export function setupTestMathStorage() {
    return new TestMathStorageAPI({
        sum(a, b) {
            return parseInt(a) + parseInt(b) + '';
        }
    })
}
