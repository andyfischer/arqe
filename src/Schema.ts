
import RelationPattern, { commandToRelationPattern } from './RelationPattern'
import Relation from './Relation'
import TagType from './TagType'
import TagTypeOrdering from './TagTypeOrdering'
import Command from './Command'
import TypeInfoListener from './TypeInfoListener'
import ExecutionPlan from './ExecutionPlan'

export default class Schema {

    tagTypes: { [name: string]: TagType } = {}
    ordering = new TagTypeOrdering()
    typeInfoListener = new TypeInfoListener(this)

    initTagType(name: string) {
        this.tagTypes[name] = new TagType(name)
    }

    findTagType(name: string) {
        if (!this.tagTypes[name]) {
            this.initTagType(name);
        }

        return this.tagTypes[name];
    }

    onRelationUpdated(command: Command, rel: Relation) {
        this.typeInfoListener.onRelationUpdated(command, rel);
    }

    stringifyRelation(rel: Relation) {
        return rel.stringify(this);
    }
}
