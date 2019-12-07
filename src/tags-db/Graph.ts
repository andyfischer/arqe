
import Command, { CommandTag } from './Command'
import parseCommand from './parseCommand'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandArgsToString } from './parseCommand'
import FullSearch from './FullSearch'
import Get from './Get'

interface Column {
    name: string
}

export default class Graph {

    relationsByNtag: { [ ntag: string]: Relation } = {}
    tagTypes: { [name: string]: TagType } = {}

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
        // console.log('exists: ', commandArgsToString(tags));
        const ntag = normalizeExactTag(tags);
        return !!this.relationsByNtag[ntag];
    }

    updateTypeInfo(rel: Relation) {
        for (const k in rel.asMap) {
            if (k !== 'typeinfo' && k !== 'option')
                throw new Error(`can't save tag ${k} with typeinfo`);
        }

        const tagType = this.findTagType(rel.asMap['typeinfo'])

        if (rel.asMap['option'] === 'inherits') {
            // console.log(`tag type '${tagType.name}' inherits`)
            tagType.inherits = true;
        }
    }

    save(command: Command) {
        //console.log('save: ', commandArgsToString(tags));

        let affectsTypeInfo = false;

        // Resolve any special tags
        for (const arg of command.tags) {
            if (arg.tagValue === '#unique')
                arg.tagValue = this.findTagType(arg.tagType).getUniqueId()

            if (arg.tagType === 'typeinfo')
                affectsTypeInfo = true;
        }

        const ntag = normalizeExactTag(command.tags);
        const existing = this.relationsByNtag[ntag];

        if (existing) {
            existing.payloadStr = command.payloadStr;
            command.respond("#done");
            return;
        }

        const relation = new Relation(ntag, command.tags, command.payloadStr);

        if (affectsTypeInfo) {
            this.updateTypeInfo(relation);
        }

        this.relationsByNtag[ntag] = relation;

        command.respond("#done");
    }

    get(command: Command) {
        try {
            const get = new Get(this, command);
            const result = get.run();
            command.respond(result);

        } catch (err) {
            console.log(err.stack || err);
            command.respond("#internal_error");
        }
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
