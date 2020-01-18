
// Schema patterns can be declared
// Each pattern has identity
// Patterns can have specified storage
// Patterns can have storage-specific info (like filesystem directory, etc)
// Patterns are ordered

// declare-plain-relation type1/* type2/*

// Access time:
//  Every time a query comes in, find the matching pattern and resolve the query
//  using that.


// Schemas to support:
//   in-memory
//   filesystem
//   in-memory object
//   branch..?
//   snapshot..?

import RelationPattern, { commandToRelationPattern } from './RelationPattern'
import StoragePlugin from './StoragePlugin'
import Relation from './Relation'
import TagType from './TagType'
import TagTypeOrdering from './TagTypeOrdering'
import Command from './Command'

interface MountedStoragePlugin {
    pattern: RelationPattern
    plugin: StoragePlugin
}

export default class Schema {

    tagTypes: { [name: string]: TagType } = {}
    ordering = new TagTypeOrdering()
    storagePlugins: MountedStoragePlugin[] = []

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
        this.storagePlugins.push({ pattern, plugin });
    }

    relationPattern(command: Command) {
        return new RelationPattern(this, command);
    }

    stringifyRelation(rel: Relation) {
        const keys = Object.keys(rel.asMap);
        keys.sort((a,b) => this.ordering.compareTagTypes(a, b));

        const args = keys.map(key => {
            const value = rel.asMap[key];
            if (key === 'option')
                return '.' + value;

            let str = key;

            if (value !== true)
                str += `/${value}`

            return str;
        });

        let payload = '';

        if (rel.payloadStr !== '#exists') {
            payload = ' == ' + rel.payloadStr;
        }

        return 'set ' + args.join(' ') + payload;
    }
}
