
import Relation from './Relation'
import RelationPattern from './RelationPattern'

export default interface RelationSearch {
    pattern: RelationPattern;
    foundRelation: (rel: Relation) => void
    finishSearch: () => void
    done?: boolean
}
