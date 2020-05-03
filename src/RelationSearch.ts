
import Relation from './Relation'
import Pattern from './Pattern'
import RelationReceiver from './RelationReceiver'

export default interface RelationSearch extends RelationReceiver {
    pattern: Pattern;
    subSearchDepth: number

    relation: (rel: Pattern) => void
    finish: () => void
}

export function newRelationSearch(pattern: Pattern, output: RelationReceiver): RelationSearch {
    return {
        pattern,
        subSearchDepth: 0,
        relation(rel) { output.relation(rel) },
        finish() { output.finish() }
    }

}
