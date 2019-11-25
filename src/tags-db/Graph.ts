
import Command, { CommandArg } from './Command'
import parseCommand from './parseCommand'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandArgsToString } from './parseCommand'

interface Column {
    name: string
}

export default class Graph {

    everyRelation: Relation[] = []

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

    saveUnique(args: CommandArg[]) {

        // console.log('save unique: ', commandArgsToString(args));

        // Resolve stars to randomly generated IDs.
        for (const arg of args) {
            if (arg.star) {
                delete arg.star; 
                arg.tagValue = this.findTagType(arg.tagType).getUniqueId()
            }
        }

        this.save(args);

        const ntag = normalizeExactTag(args);

        return 'save ' + ntag;
    }

    exists(args: CommandArg[]) {
        // console.log('exists: ', commandArgsToString(args));
        const ntag = normalizeExactTag(args);
        return !!this.relationsByNtag[ntag];
    }

    save(args: CommandArg[]) {
        //console.log('save: ', commandArgsToString(args));

        const ntag = normalizeExactTag(args);

        if (this.relationsByNtag[ntag]) {
            return;
        }

        this.relationsByNtag[ntag] = new Relation()
        return "#done"
    }

    get(args: CommandArg[]) {
        const ntag = normalizeExactTag(args);

        if (this.relationsByNtag[ntag])
            return '#exists';

        return '#null';
    }

    handleCommand(command: Command) {

        // console.log('graph handle: ', command.toCommandString());

        switch (command.command) {

        case 'save-unique': {
            return this.saveUnique(command.args);
        }

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
