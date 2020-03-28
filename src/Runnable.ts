
import RelationReceiver, { receiveToRelationStream } from './RelationReceiver'

export default interface Runnable {
    run: (msg: string, callback: (response: string) => void) => void
    run2: (command: string, output: RelationReceiver) => void
}
