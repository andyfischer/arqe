
import Command, { CommandArg } from './Command'
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

    exists(args: CommandArg[]) {
        // console.log('exists: ', commandArgsToString(args));
        const ntag = normalizeExactTag(args);
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

    save(args: CommandArg[]) {
        //console.log('save: ', commandArgsToString(args));

        let affectsTypeInfo = false;

        // Resolve any special args
        for (const arg of args) {
            if (arg.tagValue === '#unique')
                arg.tagValue = this.findTagType(arg.tagType).getUniqueId()

            if (arg.tagType === 'typeinfo')
                affectsTypeInfo = true;
        }

        const ntag = normalizeExactTag(args);

        if (this.relationsByNtag[ntag]) {
            // Already have this relation
            return;
        }

        const relation = new Relation(ntag, args);

        if (affectsTypeInfo) {
            this.updateTypeInfo(relation);
        }

        this.relationsByNtag[ntag] = relation;

        return "#done"
    }

    /*
    getWithStar(args: CommandArg[]) {
        const search = new FullSearch(this, args);
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
    getFixed(args: CommandArg[]) {
        const ntag = normalizeExactTag(args);

        if (this.relationsByNtag[ntag])
            return '#exists';

        for (const inheritTag of inheritTags) {
            const attemptArgs = args.filter(arg => arg.tagType !== inheritTag.name);
            const result = this.getFixed(attemptArgs);
            if (result === '#exists')
                return result;
        }

        return '#null';
    }
    */

    get(args: CommandArg[]) {
        try {
            const get = new Get(this, args);
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
            return this.save(command.args);
        }

        case 'get': {
            return this.get(command.args);
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
