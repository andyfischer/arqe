
import RelationPattern, { commandToRelationPattern } from './RelationPattern'
import Relation from './Relation'
import TagTypeOrdering from './TagTypeOrdering'
import Command from './Command'

export default class Schema {

    ordering = new TagTypeOrdering()

    stringifyRelation(rel: Relation) {
        return rel.stringify(this);
    }
}
