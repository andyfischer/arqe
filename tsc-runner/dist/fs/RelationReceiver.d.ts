import Graph from './Graph';
import Command from './Command';
import RelationPattern from './RelationPattern';
import { RespondFunc } from './Graph';
export default interface RelationReceiver {
    start: () => void;
    relation: (rel: RelationPattern) => void;
    finish: () => void;
    isDone: () => boolean;
}
export declare function collectRelationReceiverOutput(onDone: (rels: RelationPattern[]) => void): RelationReceiver;
export declare function receiveToStringRespond(graph: Graph, command: Command, respond: RespondFunc): RelationReceiver;
