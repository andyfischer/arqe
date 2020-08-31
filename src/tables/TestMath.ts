
import Tuple from '../Tuple'
import Stream from '../Stream'
import { handles, decoratedObjToTableMount } from '../decorators'

export class TestMath {
    name = 'TestMath'
    schemaStr = 'test-math sum a b'
    supportsCompleteScan = false

    @handles("find-with a b")
    sum({a, b}) {
        const sum = parseInt(a) + parseInt(b) + '';
        return { sum };
    }
}

export default function setupTables() {
    return [
        decoratedObjToTableMount(new TestMath())
    ]
}