
import Command from './Command'
import CommandChain from './CommandChain'
import CommandExecution from './CommandExecution'
import parseCommand, { parseCommandChain } from './parseCommand'
import Relation from './Relation'
import SetOperation from './SetOperation'
import SetResponseFormatter from './SetResponseFormatter'
import { runSearch } from './GetOperation'
import GraphListener from './GraphListener'
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
import { runJoin } from './JoinCommand'

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

    deleteCmd(commandExec: CommandExecution) {
        const pattern = commandExec.pattern;

        for (const rel of this.inMemory.findAllMatches(pattern)) {
            if (rel.includesType('typeinfo'))
                throw new Error("can't delete a typeinfo relation");

            this.inMemory.deleteRelation(rel);
            this.onRelationDeleted(rel);
        }

        commandExec.output.start();
        commandExec.output.finish();
    }

    listen(commandExec: CommandExecution) {
        commandExec.output.start();

        if (commandExec.flags.get) {
            const search = commandExec.toRelationSearch();
            search.finish = () => null;
            runSearch(this, search);
        }

        this.listeners.push({
            onRelationUpdated(rel: Relation) {
                if (commandExec.pattern.matches(rel)) {
                    commandExec.output.relation(rel);
                }
            },
            onRelationDeleted(rel: Relation) {
                if (commandExec.pattern.matches(rel)) {
                    commandExec.output.deleteRelation(rel);
                }
            }
        })
    }

    runCommandExecution(commandExec: CommandExecution) {
        try {
            switch (commandExec.commandName) {

            case 'set': {
                const set = new SetOperation(this, commandExec);
                set.run();
                return;
            }

            case 'get': {
                const search = commandExec.toRelationSearch();
                search.start();
                runSearch(this, search);
                return;
            }

            case 'dump': {
            }

            case 'delete': {
                this.deleteCmd(commandExec);
                return;
            }

            case 'listen': {
                this.listen(commandExec);
                return;
            }

            case 'join': {
                runJoin(commandExec);
            }
            
            }

            commandExec.output.error("#error unrecognized command: " + commandExec.commandName);
        } catch (err) {
            console.log(err.stack || err);
            commandExec.output.error("#internal_error");
        }
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

        if (command.commandName === 'dump') {
            this.dump(command, respond);
            return;
        }

        const commandExec = new CommandExecution(this, command);
        commandExec.outputToStringRespond(respond);
        
        this.runCommandExecution(commandExec);
    }

    runCommandChainParsed(chain: CommandChain, respond: RespondFunc) {
        // TODO: Create CommandExecution objects for these.

        if (chain.commands.length === 1)
            return this.runCommandParsed(chain.commands[0], respond);


        console.log('saw chain: ', chain.stringify());

        const commandExecs = chain.commands.map(command => {
            return new CommandExecution(this, command);
        });

        // Link up commands
        for (let index = 0; index < commandExecs.length; index++) {
            const isFirst = index == 0;
            const isLast = index == commandExecs.length - 1;
            const commandExec = commandExecs[index];

            if (isLast)
                commandExec.outputToStringRespond(respond);

            if (!isLast) {
                const next = commandExecs[index + 1];
                commandExec.outputTo(next.getInputBuffer());
            }
        }

        for (const commandExec of commandExecs)
            this.runCommandExecution(commandExec);
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

        const parsed = parseCommandChain(str);
        this.runCommandChainParsed(parsed, respond);
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
