
import Command, { CommandTag } from './Command'
import parseCommand from './parseCommand'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandArgsToString } from './parseCommand'
import FullSearch from './FullSearch'
import Get from './Get'
import TagTypeOrdering from './TagTypeOrdering'

interface Column {
    name: string
}

export default class Graph {

    relationsByNtag: { [ ntag: string]: Relation } = {}
    tagTypes: { [name: string]: TagType } = {}
    ordering = new TagTypeOrdering

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

    save(command: Command) {
        //console.log('save: ', commandArgsToString(tags));

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
        const existing = this.relationsByNtag[ntag];

        if (existing) {
            existing.setPayload(command.payloadStr);
        } else {
            const relation = new Relation(this, ntag, command.tags, command.payloadStr);

            if (affectsTypeInfo) {
                this.updateTypeInfo(relation);
            }

            this.relationsByNtag[ntag] = relation;
        }

        if (expectsEcho) {
            command.respond(this.stringifyRelation(this.relationsByNtag[ntag]));
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
        for (const ntag in this.relationsByNtag) {
            const rel = this.relationsByNtag[ntag];
            command.respondPart(this.stringifyRelation(rel));
        }

        command.respondEnd();
    }

    deleteCmd(command: Command) {
        const get = new Get(this, command);
        for (const rel of get.matchingRelations()) {
            if (rel.has('typeinfo'))
                throw new Error("can't delete a typeinfo relation");

            delete this.relationsByNtag[rel.ntag];
        }
        command.respond('#done');
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

        return 'save ' + args.join(' ') + payload;
    }

    handleCommand(command: Command) {

        switch (command.command) {

        case 'save': {
            this.save(command);
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
        
        }

        command.respond("unrecognized command: " + command.command);
    }

    handleCommandStr(str: string) {
        let result = null;

        try { 

            const parsed = parseCommand(str);
            parsed.respond = msg => { result = msg; }
            this.handleCommand(parsed);
            return result;

        } catch (err) {
            console.log('handleCommandStr error: ', err);
            return '';
        }
    }
}
