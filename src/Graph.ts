
import Command from './Command'
import CommandChain from './CommandChain'
import CommandExecution from './CommandExecution'
import parseCommand from './parseCommand'
import Relation from './Relation'
import SetOperation from './SetOperation'
import GetOperation from './GetOperation'
import GraphListener from './GraphListener'
import GraphListenerToCallback from './GraphListenerToCallback'
import RelationPattern, { commandToRelationPattern } from './RelationPattern'
import collectRespond from './collectRespond'
import Schema from './Schema'
import InMemoryStorage from './InMemoryStorage'
import SavedQuery from './SavedQuery'
import StorageMount from './StorageMount'
import EagerValue from './EagerValue'
import { UpdateFn } from './UpdateContext'
import updateFilesystemMounts from './updateFilesystemMounts'
import InheritTags, { updateInheritTags } from './InheritTags'
import TypeInfo from './TypeInfo'
import GraphContext from './GraphContext'
import WebSocketProvider, { updateWebSocketProviders } from './WebSocketProvider'

export type RespondFunc = (msg: string) => void
export type RunFunc = (query: string, respond: RespondFunc) => void

export default class Graph {

    inMemory = new InMemoryStorage()
    listeners: GraphListener[] = []

    savedQueries: SavedQuery[] = []
    savedQueryMap: { [queryStr:string]: SavedQuery } = {}

    schema = new Schema()
    typeInfo: { [typeName: string]: TypeInfo } = {}
    inheritTags: EagerValue<InheritTags>
    filesystemMounts: EagerValue<StorageMount[]>
    wsProviders: EagerValue<WebSocketProvider[]>

    nextEagerValueId: number = 1

    constructor() {
        this.filesystemMounts = this.eagerValue(updateFilesystemMounts);
        this.inheritTags = this.eagerValue(updateInheritTags, new InheritTags());
        this.eagerValue(this.schema.ordering.update);
        this.wsProviders = this.eagerValue(updateWebSocketProviders);
    }

    context(query: string) {
        const cxt = new GraphContext(this);
        cxt.run('context ' + query, () => null);
        return cxt;
    }

    savedQuery(queryStr: string): SavedQuery {
        if (this.savedQueryMap[queryStr])
            return this.savedQueryMap[queryStr];

        if (this.savedQueries.length == 100)
            console.log('warning: more than 100 saved queries');

        const query = new SavedQuery(this, this.savedQueries.length, queryStr);
        this.savedQueries.push(query);
        this.savedQueryMap[queryStr] = query;

        return query;
    }

    eagerValue<T>(updateFn: UpdateFn<T>, initialValue?: T): EagerValue<T> {
        const ev = new EagerValue<T>(this, updateFn, initialValue);
        ev.runUpdate();
        return ev;
    }

    *iterateMounts() {
        if (this.filesystemMounts) {
            const mounts = this.filesystemMounts.get();
            for (const mount of mounts)
                yield mount;
        }
    }

    getTypeInfo(name: string) {
        if (!this.typeInfo[name]) {
            this.typeInfo[name] = new TypeInfo();
        }

        return this.typeInfo[name];
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
            const commandExec = new CommandExecution(this, command);
            commandExec.outputToStringRespond(respond, formatter => {
                formatter.skipStartAndDone = true;
                formatter.asMultiResults = true;
                formatter.asSetCommands = true;
            });
            const get = new GetOperation(this, commandExec);

            get.run();
        }

        const listener = new GraphListenerToCallback(this, command, respond);
        this.listeners.push(listener);
    }

    runCommandExecution(command: CommandExecution) {
    }

    runCommandParsed(command: Command, respond: RespondFunc) {

        // Maybe divert to socket
        const wsProviders = this.wsProviders && this.wsProviders.get();
        if (wsProviders) {
            for (const provider of wsProviders) {
                if (provider.pattern.isSupersetOf(command.toPattern())) {
                    provider.handle(command, respond);
                    return;
                }
            }
        }

        // TODO: Move this code to runCommandExecution
        
        try {
            switch (command.commandName) {

            case 'set': {
                const set = new SetOperation(this, command, respond)
                set.run();
                return;
            }

            case 'get': {
                const commandExec = new CommandExecution(this, command);
                commandExec.outputToStringRespond(respond);
                const get = new GetOperation(this, commandExec);
                get.run();
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

            respond("#error unrecognized command: " + command.commandName);
        } catch (err) {
            console.log(err.stack || err);
            respond("#internal_error");
        }
    }

    runCommandChainParsed(chain: CommandChain, respond: RespondFunc) {
        // TODO: Create CommandExecution objects for these.

        if (chain.commands.length === 1)
            return this.runCommandParsed(chain.commands[0], respond);
    }

    onRelationUpdated(command: Command, rel: Relation) {

        for (const listener of this.listeners)
            listener.onRelationUpdated(rel);

        for (const savedQuery of this.savedQueries) {
            const matches = savedQuery.pattern.matches(rel);

            if (!matches)
                continue;

            savedQuery.changeToken += 1;
            savedQuery.updateConnectedValues();
        }
    }

    onRelationDeleted(rel: Relation) {
        for (const listener of this.listeners)
            listener.onRelationDeleted(rel);

        for (const savedQuery of this.savedQueries) {
            if (savedQuery.pattern.matches(rel)) {
                savedQuery.changeToken += 1;
                savedQuery.updateConnectedValues();
            }
        }
    }

    run(str: string, respond?: RespondFunc) {
        if (!respond) {
            respond = (msg) => {
                if (msg.startsWith('#error')) {
                    console.log(`Uncaught error when running '${str}': ${msg}`);
                }
            }
        }

        const parsed = parseCommand(str);

        // TODO: Switch to runCommandExecution

        this.runCommandParsed(parsed, respond);
    }

    runSync(commandStr: string) {
        let result = null;

        const collector = collectRespond(r => { result = r; });
        
        this.run(commandStr, collector);

        if (result === null)
            throw new Error("command didn't have sync response in runSync");

        return result;
    }

    runAsync(commandStr: string): Promise<string | string[]> {
        return new Promise(resolve => {
            const collector = collectRespond(resolve);
            this.run(commandStr, collector);
        })
    }

    relationPattern(commandStr: string) {
        const parsed = parseCommand(commandStr);
        return parsed.toPattern();
    }

}
