import Graph from './Graph';
import Relation from './Relation';
import RelationReceiver from './RelationReceiver';
export declare function receiveToRelationList(onDone: (rels: Relation[]) => void): RelationReceiver;
export declare function receiveToRelationListPromise(): {
    receiver: RelationReceiver;
    promise: Promise<Relation[]>;
};
export declare function runAsync(graph: Graph, command: string): Promise<Relation[]>;
export declare function fallbackReceiver(commandString: string): RelationReceiver;
