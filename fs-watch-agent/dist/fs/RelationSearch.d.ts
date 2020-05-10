import Pattern from './Pattern';
import RelationReceiver from './RelationReceiver';
export default interface RelationSearch extends RelationReceiver {
    pattern: Pattern;
    subSearchDepth: number;
    relation: (rel: Pattern) => void;
    finish: () => void;
}
export declare function relationSearchFromPattern(pattern: Pattern, output: RelationReceiver): RelationSearch;
