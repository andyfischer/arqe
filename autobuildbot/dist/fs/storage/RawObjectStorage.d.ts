import Relation from '../Relation';
import Pattern from '../Pattern';
import SearchOperation from '../SearchOperation';
import StorageProvider from '../StorageProvider';
import RelationReceiver from '../RelationReceiver';
export default class RawObjectStorage implements StorageProvider {
    linkedPattern: Pattern;
    value: any;
    variedType: string;
    constructor(pattern: Pattern);
    findAllMatches(pattern: Pattern): Generator<Pattern, void, unknown>;
    runSearch(search: SearchOperation): void;
    runSave(relation: Relation, output: RelationReceiver): void;
}
