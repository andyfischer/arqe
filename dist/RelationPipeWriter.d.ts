import Relation from './Relation';
import RelationPipeReader from './RelationPipeReader';
export default class RelationPipeWriter {
    _downstream: RelationPipeReader;
    assertReady(): void;
    connectToReader(reader: RelationPipeReader): void;
    relation(rel: Relation): void;
    isDone(): boolean;
    finish(): void;
}
