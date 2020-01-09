
import Command, { CommandTag } from './Command'
import parseCommand from './parseCommand'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandArgsToString } from './parseCommand'
import SetOperation from './SetOperation'
import GetOperation from './GetOperation'
import TagTypeOrdering from './TagTypeOrdering'
import GraphListener from './GraphListener'
import TypeInfoListener from './TypeInfoListener'
import StoragePlugin from './StoragePlugin'
import RelationPattern, { commandToRelationPattern } from './RelationPattern'

export type ListenerAction = 'set' | 'delete'
export type RespondFunc = (str: string) => void

interface MountedStoragePlugin {
    pattern: RelationPattern
    plugin: StoragePlugin
}

export default class Graph {

    relationsByNtag: { [ ntag: string]: Relation } = {}
    tagTypes: { [name: string]: TagType } = {}
    ordering = new TagTypeOrdering()
    listeners: GraphListener[] = []
    typeInfoListener = new TypeInfoListener()
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

    findStoragePlugin(relation: Relation): StoragePlugin {
        for (const { plugin, pattern } of this.storagePlugins) {
            if (pattern.matches(relation))
                return plugin;
        }

        return null;
    }

    dump(command: Command, respond: RespondFunc) {
        respond('#start');

        for (const ntag in this.relationsByNtag) {
            const rel = this.relationsByNtag[ntag];
            respond(this.stringifyRelation(rel));
        }

        respond('#done');
    }

    deleteCmd(command: Command, respond: RespondFunc) {
        const pattern = new RelationPattern(this, command);

        for (const rel of pattern.allMatches()) {
            if (rel.has('typeinfo'))
                throw new Error("can't delete a typeinfo relation");

            const found = this.relationsByNtag[rel.ntag];
            delete this.relationsByNtag[rel.ntag];
            this.onRelationDeleted(found);
        }

        respond('#done');
    }

    listen(command: Command, respond: RespondFunc) {
        respond('#start');
        const listener = new GraphListener(this, command);
        this.listeners.push(listener);
        listener.addCallback(respond);
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

    handleCommand(command: Command, respond: RespondFunc) {

        try {
            switch (command.command) {

            case 'set': {
                const set = new SetOperation(this, command, respond)
                set.perform();
                return;
            }

            case 'get': {
                const get = new GetOperation(this, command, respond);
                get.perform();
                return;
            }

            case 'dump': {
                this.dump(command, respond);
                return;
            }

            case 'delete': {
                this.deleteCmd(command, respond);
                return;
            }

            case 'listen': {
                this.listen(command, respond);
                return;
            }
            
            }

            respond("unrecognized command: " + command.command);
        } catch (err) {
            console.log(err.stack || err);
            respond("#internal_error");
        }
    }

    onRelationUpdated(command: Command, rel: Relation) {
        this.typeInfoListener.onRelationUpdated(command, rel);

        for (const listener of this.listeners)
            listener.onRelationUpdated(rel);
    }

    onRelationDeleted(rel: Relation) {
        for (const listener of this.listeners)
            listener.onRelationDeleted(rel);
    }

    run(commandStr: string, respond?: RespondFunc) {
        respond = respond || (() => null);
        const parsed = parseCommand(commandStr);
        this.handleCommand(parsed, respond);
    }

    runSync(commandStr: string) {
        let result = null;

        this.run(commandStr, response => {
            if (result !== null)
                throw new Error("got multiple responses in runSync");

            result = response;
        });

        if (result === null)
            throw new Error("command didn't have sync response in runSync");

        return result;
    }

    installStorage(patternStr: string, plugin: StoragePlugin) {
        const pattern = commandToRelationPattern(this, patternStr);
        this.storagePlugins.push({ pattern, plugin });
    }
}
