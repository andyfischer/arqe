
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
export type RespondFunc = (str: string) => void

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

    set(command: Command, respond: RespondFunc) {
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
            respond(this.stringifyRelation(relation));
        } else {
            respond("#done");
        }
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
        const get = new Get(this, command);
        for (const rel of get.matchingRelations()) {
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
                this.set(command, respond);
                return;
            }

            case 'get': {
                const get = new Get(this, command);
                const result = get.formattedResult();
                respond(result);
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

    onRelationUpdated(rel: Relation) {
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

    // TODO: delete in favor of run() ?
    addListener(commandStr: string, callback: RespondFunc) {
        const parsed = parseCommand(commandStr);
        this.handleCommand(parsed, callback);
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
}
