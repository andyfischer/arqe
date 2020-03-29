
import RelationReceiver, { receiveToRelationStream } from './RelationReceiver'

export default interface Runnable {
    run2: (command: string, output: RelationReceiver) => void
}
