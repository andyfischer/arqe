
import Tuple from '../Tuple'
import Stream from '../Stream'
import { handles } from '../decorators'

export class TestMath {
    name = 'TestMath'
    schema = 'test-math sum a b'
    supportsCompleteScan = false

    @handles("get test-math a/$a b/$b sum")
    sum({a, b}) {
        const sum = parseInt(a) + parseInt(b) + '';

        return { sum };
    }
}
