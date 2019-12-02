
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

    save(tags: CommandTag[]) {
        //console.log('save: ', commandArgsToString(tags));

        let affectsTypeInfo = false;

        // Resolve any special tags
        for (const arg of tags) {
            if (arg.tagValue === '#unique')
                arg.tagValue = this.findTagType(arg.tagType).getUniqueId()

            if (arg.tagType === 'typeinfo')
                affectsTypeInfo = true;
        }

        const ntag = normalizeExactTag(tags);

        if (this.relationsByNtag[ntag]) {
            // Already have this relation
            return;
        }

        const relation = new Relation(ntag, tags);

        if (affectsTypeInfo) {
            this.updateTypeInfo(relation);
        }

        this.relationsByNtag[ntag] = relation;

        return "#done"
    }

    /*
    getWithStar(tags: CommandTag[]) {
        const search = new FullSearch(this, tags);
        const matches = search.run();
        const variedType = search.starValueArgs[0];

        const outValues = []
        for (const match of matches) {
            outValues.push(match.asMap[variedType.tagType]);
        }

        return '[' + outValues.join(', ') + ']'
    }
    */

    /*
    getFixed(tags: CommandTag[]) {
        const ntag = normalizeExactTag(tags);

        if (this.relationsByNtag[ntag])
            return '#exists';

        for (const inheritTag of inheritTags) {
            const attemptArgs = tags.filter(arg => arg.tagType !== inheritTag.name);
            const result = this.getFixed(attemptArgs);
            if (result === '#exists')
                return result;
        }

        return '#null';
    }
    */

    get(tags: CommandTag[]) {
        try {
            const get = new Get(this, tags);
            const result = get.run();
            return result;
        } catch (err) {
            console.log(err.stack || err);
            return '#internal_error'
        }
    }

    handleCommand(command: Command) {

        // console.log('graph handle: ', command.toCommandString());

        switch (command.command) {

        case 'save': {
            return this.save(command.tags);
        }

        case 'get': {
            return this.get(command.tags);
        }
        
        }

        return "unrecognized command: " + command.command;
    }

    handleCommandStr(str: string) {
        try { 
            const parsed = parseCommand(str);
            return this.handleCommand(parsed);
        } catch (err) {
            console.log('handleCommandStr error: ', err);
        }
    }
}
