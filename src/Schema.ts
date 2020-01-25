
import RelationPattern, { commandToRelationPattern } from './RelationPattern'
import StoragePlugin from './StoragePlugin'
import Relation from './Relation'
import TagType from './TagType'
import TagTypeOrdering from './TagTypeOrdering'
import Command from './Command'
import TypeInfoListener from './TypeInfoListener'
import ExecutionPlan from './ExecutionPlan'

interface MountedStoragePlugin {
    pattern: RelationPattern
    plugin: StoragePlugin
}

export default class Schema {

    tagTypes: { [name: string]: TagType } = {}
    ordering = new TagTypeOrdering()
    storagePlugins: MountedStoragePlugin[] = []
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

    installStorage(patternStr: string, plugin: StoragePlugin) {
        const pattern = commandToRelationPattern(this, patternStr);
        // this.storagePlugins.push({ pattern, plugin });
    }

    onRelationUpdated(command: Command, rel: Relation) {
        this.typeInfoListener.onRelationUpdated(command, rel);
    }

    relationPattern(command: Command) {
        return new RelationPattern(this, command);
    }

    stringifyRelation(rel: Relation) {
        const keys = rel.tags.map(t => t.tagType);
        keys.sort((a,b) => this.ordering.compareTagTypes(a, b));

        const args = keys.map(key => {
            const value = rel.getTagValue(key);
            if (key === 'option')
                return '.' + value;

            let str = key;

            if (value !== true)
                str += `/${value}`

            return str;
        });

        let payload = '';

        if (rel.payloadStr !== null) {
            payload = ' == ' + rel.payloadStr;
        }

        return 'set ' + args.join(' ') + payload;
    }
}
