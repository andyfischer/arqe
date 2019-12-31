
import Command, { CommandTag } from './Command'
import parseCommand from './parseCommand'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandArgsToString } from './parseCommand'
import Get from './Get'
import TagTypeOrdering from './TagTypeOrdering'
import GraphListener from './GraphListener'

export type ListenerAction = 'set' | 'delete'
export type ListenerCallback = (str: string) => void

export default class Graph {

    relationsByNtag: { [ ntag: string]: Relation } = {}
    tagTypes: { [name: string]: TagType } = {}
    ordering = new TagTypeOrdering()
    listeners: GraphListener[] = []

    initTagType(name: string) {
        this.tagTypes[name] = new TagType(name)
    }

    findTagType(name: string) {
        if (!this.tagTypes[name]) {
            this.initTagType(name);
        }

        return this.tagTypes[name];
    }

    exists(tags: CommandTag[]) {
        const ntag = normalizeExactTag(tags);
        return !!this.relationsByNtag[ntag];
    }

    updateTypeInfo(rel: Relation) {
        const tagType = this.findTagType(rel.get('typeinfo'))

        if (rel.getOptional('option', null) === 'inherits') {
            tagType.inherits = true;
            return;
        }
        
        if (rel.getOptional('option', null) === 'order') {
            this.ordering.updateInfo(rel);
            return;
        }
    }

    set(command: Command) {
        //console.log('set: ', commandArgsToString(tags));

        let affectsTypeInfo = false;
        let expectsEcho = false;

        // Resolve any special tags
        for (const arg of command.tags) {
            if (arg.tagValue === '#unique') {
                arg.tagValue = this.findTagType(arg.tagType).getUniqueId()
                expectsEcho = true;
            }

            if (arg.tagType === 'typeinfo')
                affectsTypeInfo = true;
        }

        const ntag = normalizeExactTag(command.tags);
        let relation = this.relationsByNtag[ntag];

        if (relation) {
            relation.setPayload(command.payloadStr);
        } else {
            relation = new Relation(this, ntag, command.tags, command.payloadStr);

            if (affectsTypeInfo) {
                this.updateTypeInfo(relation);
            }

            this.relationsByNtag[ntag] = relation;
        }

        this.onRelationUpdated(relation);

        if (expectsEcho) {
            command.respond(this.stringifyRelation(relation));
        } else {
            command.respond("#done");
        }
    }

    get(command: Command) {
        try {
            const get = new Get(this, command);
            const result = get.formattedResult();
            command.respond(result);

        } catch (err) {
            console.log(err.stack || err);
            command.respond("#internal_error");
        }
    }

    dump(command: Command) {
        command.respond('#start');
        for (const ntag in this.relationsByNtag) {
            const rel = this.relationsByNtag[ntag];
            command.respond(this.stringifyRelation(rel));
        }

        command.respond('#done');
    }

    deleteCmd(command: Command) {
        const get = new Get(this, command);
        for (const rel of get.matchingRelations()) {
            if (rel.has('typeinfo'))
                throw new Error("can't delete a typeinfo relation");

            const found = this.relationsByNtag[rel.ntag];
            delete this.relationsByNtag[rel.ntag];
            this.onRelationDeleted(found);
        }

        command.respond('#done');
    }

    listen(command: Command) {
        command.respond('#start');
        const listener = new GraphListener(this, command);
        this.listeners.push(listener);
        listener.addCallback(str => command.respond(str));
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

    handleCommand(command: Command) {

        switch (command.command) {

        case 'set': {
            this.set(command);
            return;
        }

        case 'get': {
            this.get(command);
            return;
        }

        case 'dump': {
            this.dump(command);
            return;
        }

        case 'delete': {
            this.deleteCmd(command);
            return;
        }

        case 'listen': {
            this.listen(command);
            return;
        }
        
        }

        command.respond("unrecognized command: " + command.command);
    }

    onRelationUpdated(rel: Relation) {
        for (const listener of this.listeners)
            listener.onRelationUpdated(rel);
    }

    onRelationDeleted(rel: Relation) {
        for (const listener of this.listeners)
            listener.onRelationDeleted(rel);
    }

    handleCommandStr(commandStr: string) {
        let result = null;
        const parsed = parseCommand(commandStr);
        parsed.respond = msg => { result = msg; }
        this.handleCommand(parsed);
        return result;
    }

    addListener(commandStr: string, callback: ListenerCallback) {
        const parsed = parseCommand(commandStr);
        parsed.respond = callback;
        this.handleCommand(parsed);
    }
}
