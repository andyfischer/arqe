
import Tuple from './Tuple'
import TupleReceiver from './TupleReceiver'

export default interface GraphLike {
    runSync: (commandStr: string) => Tuple[];
    run: (commandStr: string, output: TupleReceiver) => void
}
