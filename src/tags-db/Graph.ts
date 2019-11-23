
import parseCommand, { ParsedCommand, ParsedArg } from './parseCommand'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag } from './parseCommand'

interface Column {
    name: string
}

export default class Graph {

    parent: Graph
    typesAddedToParent: { [name: string]: boolean } = {}

    everyRelation: Relation[] = []

    relationsByNtag: { [ ntag: string]: Relation } = {}
    tagTypes: { [name: string]: TagType } = {}

    getGraphWithContext(args: ParsedArg[]) {
        const newGraph = new Graph();
        newGraph.parent = this;
        for (const arg of args)
            newGraph.typesAddedToParent[arg.tagType] = true;
        return newGraph;
    }

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

        this.save(args);

        const ntag = normalizeExactTag(args);

        return ntag;
    }

    exists(args: ParsedArg[]) {
        const ntag = normalizeExactTag(args);
        return !!this.relationsByNtag[ntag];
    }

    save(args: ParsedArg[]) {
        const ntag = normalizeExactTag(args);

        if (this.relationsByNtag[ntag]) {
            return;
        }

        this.relationsByNtag[ntag] = new Relation()
        return "#done"
    }

    get(args: ParsedArg[]) {
        const ntag = normalizeExactTag(args);

        if (this.relationsByNtag[ntag])
            return '#exists';

        return null;
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
            return this.handleCommand(parsed);
        } catch (err) {
            console.log('handleCommandStr error: ', err);
        }
    }
}
