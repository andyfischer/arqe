
import parseCommand, { ParsedCommand, ParsedArg } from './parseCommand'
import TagType from './TagType'

interface Relation {
    ntag: string
    value: any
}

interface Column {
    name: string
}

export default class Graph {
    everyRelation: Relation[] = []
    tagTypes: { [name: string]: TagType }

    initTagType(name: string) {
        this.tagTypes[name] = new TagType(name)
    }

    findTagType(name: string) {
        if (!this.tagTypes[name]) {
            this.initTagType(name);
        }

        return this.tagTypes[name];
    }

    saveUnique(args: ParsedArg[]) {
        // Resolve stars to randomly generated IDs.
        for (const arg of args) {
            if (arg.star) {
                delete arg.star; 
                arg.tagValue = this.findTagType(arg.tagType).getUniqueId()
            }
        }


    }

    exists(args: ParsedArg[]) {
    }

    save(args: ParsedArg[]) {
    }

    get(args: ParsedArg[]) {
    }

    handleCommand(command: ParsedCommand) {
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
        } catch (err) {
            console.log('handleCommandStr error: ', err);
        }
    }
}
