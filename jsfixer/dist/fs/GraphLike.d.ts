import Relation from './Relation';
import RelationReceiver from './RelationReceiver';
export default interface GraphLike {
    runSync: (commandStr: string) => Relation[];
    run: (commandStr: string, output: RelationReceiver) => void;
}
