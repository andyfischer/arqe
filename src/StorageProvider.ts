
import Command from './Command'
import Tuple from './Tuple'
import Pattern from './Pattern'
import TupleReceiver from './TupleReceiver'

export default interface StorageProvider {
    runSearch: (pattern: Pattern, output: TupleReceiver) => void
    runSave: (pattern: Pattern, output: TupleReceiver) => void
}
