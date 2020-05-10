import Relation from './Relation';
export default class RelationPipeReader {
    _onRelation: (rel: Relation) => void;
    _onDone: () => void;
    _wasClosed: boolean;
    onRelation(callback: (rel: Relation) => void): void;
    onDone(callback: () => void): void;
    waitForAll(callback: (rels: Relation[]) => void): void;
}
