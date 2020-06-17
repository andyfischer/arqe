
import Tuple from './Tuple'
import Stream from './Stream'

export default interface GraphLike {
    runSync: (commandStr: string) => Tuple[];
    run: (commandStr: string, output: Stream) => void
}
