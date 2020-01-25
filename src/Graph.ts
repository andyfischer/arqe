
import Command, { CommandTag } from './Command'
import parseCommand from './parseCommand'
import TagType from './TagType'
import Relation from './Relation'
import { normalizeExactTag, commandArgsToString } from './parseCommand'
import SetOperation from './SetOperation'
import GetOperation from './GetOperation'
import GraphListener from './GraphListener'
import RelationPattern from './RelationPattern'
import collectRespond from './collectRespond'
import Schema from './Schema'
import StoragePlugin from './StoragePlugin'
import InMemoryStorage from './InMemoryStorage'

export type RespondFunc = (str: string) => void

export default class Graph {

    inMemory = new InMemoryStorage()
    listeners: GraphListener[] = []
    schema = new Schema()

    findStoragePlugin(relation: Relation): StoragePlugin {
        for (const { plugin, pattern } of this.schema.storagePlugins) {
            if (pattern.matches(relation))
                return plugin;
        }

        return null;
    }

    dump(command: Command, respond: RespondFunc) {
        respond('#start');

        for (const rel of this.inMemory.everyRelation()) {
            respond(this.schema.stringifyRelation(rel));
        }

        respond('#done');
    }

    deleteCmd(command: Command, respond: RespondFunc) {
        const pattern = this.schema.relationPattern(command);

        for (const rel of this.inMemory.findAllMatches(pattern)) {
            if (rel.has('typeinfo'))
                throw new Error("can't delete a typeinfo relation");

            this.inMemory.deleteRelation(rel);
            this.onRelationDeleted(rel);
        }

        respond('#done');
    }

    listen(command: Command, respond: RespondFunc) {
        respond('#start');

        if (command.flags.get) {
            const get = new GetOperation(this, command);

            for (const s of get.formattedResults()) {
                respond('set ' + s);
            }
        }

        const listener = new GraphListener(this, command);
        this.listeners.push(listener);
        listener.addCallback(respond);
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
                const get = new GetOperation(this, command);
                get.perform(respond);
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

}
