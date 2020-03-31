
import RelationReceiver, { receiveToRelationStream } from './RelationReceiver'

export default interface Runnable {
    run: (command: string, output: RelationReceiver) => void
}
