
import Command, { CommandTag } from './Command'
import parseCommand from './parseCommand'
import TagType from './TagType'
import Relation from './Relation'
import SetOperation from './SetOperation'
import GetOperation from './GetOperation'
import GraphListener from './GraphListener'
import GraphListenerToCallback from './GraphListenerToCallback'
import RelationPattern, { commandToRelationPattern } from './RelationPattern'
import collectRespond from './collectRespond'
import Schema from './Schema'
import StorageProvider from './StorageProvider'
import InMemoryStorage from './InMemoryStorage'
import FilesystemMounts from './FilesystemMounts'

export type RespondFunc = (msg: string) => void
export type RunFunc = (query: string, respond: RespondFunc) => void

interface StorageMount {
    pattern: RelationPattern
    storage: StorageProvider
}

export default class Graph {

    inMemory = new InMemoryStorage()
    listeners: GraphListener[] = []
    schema = new Schema()
    filesystemMounts: FilesystemMounts

    constructor() {
        this.filesystemMounts = new FilesystemMounts(this)
    }

    *iterateMounts() {
        if (this.filesystemMounts) {
            yield* this.filesystemMounts.iterateMounts();
        }
    }

    dump(command: Command, respond: RespondFunc) {
        respond('#start');

        for (const rel of this.inMemory.everyRelation()) {
            respond(this.schema.stringifyRelation(rel));
        }

        respond('#done');
    }

    deleteCmd(command: Command, respond: RespondFunc) {
        const pattern = command.toPattern();

        for (const rel of this.inMemory.findAllMatches(pattern)) {
            if (rel.includesType('typeinfo'))
                throw new Error("can't delete a typeinfo relation");

            this.inMemory.deleteRelation(rel);
            this.onRelationDeleted(rel);
        }

        respond('#done');
    }

    listen(command: Command, respond: RespondFunc) {
        respond('#start');

        if (command.flags.get) {
            const get = new GetOperation(this, command, respond);
            get.formatter.skipStartAndDone = true;
            get.formatter.asMultiResults = true;
            get.formatter.asSetCommands = true;
            get.perform();
        }

        const listener = new GraphListenerToCallback(this, command, respond);
        this.listeners.push(listener);
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

            respond("#error unrecognized command: " + command.command);
        } catch (err) {
            console.log(err.stack || err);
            respond("#internal_error");
        }
    }

    onRelationUpdated(command: Command, rel: Relation) {
        this.schema.onRelationUpdated(command, rel);
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

        const collector = collectRespond(r => { result = r; });
        
        this.run(commandStr, collector);

        if (result === null)
            throw new Error("command didn't have sync response in runSync");

        return result;
    }

    relationPattern(commandStr: string) {
        const parsed = parseCommand(commandStr);
        return parsed.toPattern();
    }
}
