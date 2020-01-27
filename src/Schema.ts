
import RelationPattern, { commandToRelationPattern } from './RelationPattern'
import StorageProvider from './StorageProvider'
import Relation from './Relation'
import TagType from './TagType'
import TagTypeOrdering from './TagTypeOrdering'
import Command from './Command'
import TypeInfoListener from './TypeInfoListener'
import ExecutionPlan from './ExecutionPlan'

interface MountedStorage {
    pattern: RelationPattern
    plugin: StorageProvider
}

export default class Schema {

    tagTypes: { [name: string]: TagType } = {}
    ordering = new TagTypeOrdering()
    storagePlugins: MountedStorage[] = []
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

    installStorage(patternStr: string, storage: StorageProvider) {
        const pattern = commandToRelationPattern(this, patternStr);
        // this.storagePlugins.push({ pattern, plugin });
    }

    onRelationUpdated(command: Command, rel: Relation) {
        this.typeInfoListener.onRelationUpdated(command, rel);
    }

    relationPattern(command: Command) {
        return new RelationPattern(this, command.tags);
    }

    stringifyRelation(rel: Relation) {
        return rel.stringify(this);
    }
}
