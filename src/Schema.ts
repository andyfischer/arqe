
import RelationPattern, { commandToRelationPattern } from './RelationPattern'
import Relation from './Relation'
import TagType from './TagType'
import TagTypeOrdering from './TagTypeOrdering'
import Command from './Command'

export default class Schema {

    tagTypes: { [name: string]: TagType } = {}
    ordering = new TagTypeOrdering()

    initTagType(name: string) {
        this.tagTypes[name] = new TagType(name)
    }

    findTagType(name: string) {
        if (!this.tagTypes[name]) {
            this.initTagType(name);
        }

        return this.tagTypes[name];
    }

    stringifyRelation(rel: Relation) {
        return rel.stringify(this);
    }
}
