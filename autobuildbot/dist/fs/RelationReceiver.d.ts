import Relation from './Relation';
export default interface RelationReceiver {
    relation: (rel: Relation) => void;
    finish: () => void;
}
export declare function receiveToRelationStream(onRel: (rel: Relation) => void, onDone: () => void): RelationReceiver;
export declare function receiveToNull(): RelationReceiver;
