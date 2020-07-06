
import Command from './Command'
import Tuple from './Tuple'
import Pattern from './Pattern'
import Stream from './Stream'

export default interface StorageProvider {
    runSearch: (pattern: Pattern, output: Stream) => void
    runSave: (pattern: Pattern, output: Stream) => void
}
