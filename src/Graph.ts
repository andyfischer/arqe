
import Command from './Command'
import CommandChain from './CommandChain'
import CommandExecution from './CommandExecution'
import parseCommand, { parseCommandChain } from './parseCommand'
import Relation from './Relation'
import SetOperation from './SetOperation'
import SetResponseFormatter from './SetResponseFormatter'
import { runSearch } from './Search'
import GraphListener from './GraphListener'
import Pattern, { commandToRelationPattern } from './Pattern'
import collectRespond from './collectRespond'
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
import { receiveToStringRespond } from './RelationReceiver'
import { runCommandChain } from './ChainedExecution'
import { emitSearchPatternMeta, emitCommandError } from './CommandMeta'
import { parsedCommandToString } from './stringifyQuery'
import UpdateContext from './UpdateContext'
import Fs from 'fs'
import TagTypeOrdering from './TagTypeOrdering'
import runningInBrowser from './context/runningInBrowser'

export type RespondFunc = (msg: string) => void
export type RunFunc = (query: string, respond: RespondFunc) => void

export default class Graph {

    inMemory = new InMemoryStorage()
    listeners: GraphListener[] = []

    savedQueries: SavedQuery[] = []
    savedQueryMap: { [queryStr:string]: SavedQuery } = {}

    ordering = new TagTypeOrdering()
    typeInfo: { [typeName: string]: TypeInfo } = {}
    inheritTags: EagerValue<InheritTags>
    filesystemMounts: EagerValue<StorageMount[]>
    wsProviders: EagerValue<WebSocketProvider[]>
    derivedValueMounts: StorageMount[] = []

    nextEagerValueId: number = 1

    constructor() {
        if (runningInBrowser())
            this.filesystemMounts = this.eagerValue(() => []);
        else
            this.filesystemMounts = this.eagerValue(updateFilesystemMounts);
        this.inheritTags = this.eagerValue(updateInheritTags, new InheritTags());
        this.eagerValue(this.ordering.update);
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

        for (const mount of this.derivedValueMounts)
            yield mount;
    }

    getTypeInfo(name: string) {
        if (!this.typeInfo[name]) {
            this.typeInfo[name] = new TypeInfo();
        }

        return this.typeInfo[name];
    }

    deleteCmd(commandExec: CommandExecution) {
        const pattern = commandExec.pattern;

        for (const rel of this.inMemory.findAllMatches(pattern)) {
            if (rel.hasType('typeinfo'))
                throw new Error("can't delete a typeinfo relation");

            rel.wasDeleted = true;
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
                if (!rel.wasDeleted) {
                    throw new Error('onRelationDeleted called but rel.wasDeleted is false');
                }

                if (commandExec.pattern.matches(rel)) {
                    commandExec.output.relation(rel);
                }
            },
            finish() {
                commandExec.output.finish();
            }
        })
    }

    runCommandExecution(commandExec: CommandExecution) {

        if (commandExec.start) {
            commandExec.start();
            return;
        }

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
                emitSearchPatternMeta(commandExec.command.toPattern(), search);
                runSearch(this, search);
                return;
            }

            case 'dump': {
                commandExec.output.start();
                for (const rel of this.inMemory.everyRelation()) {
                    commandExec.output.relation(rel);
                }
                commandExec.output.finish();
                return;
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
                // handled in setupCommandExecution
                return;
            }
            
            }

            emitCommandError(commandExec.output, "#error unrecognized command: " + commandExec.commandName);
        } catch (err) {
            console.log(err.stack || err);
            emitCommandError(commandExec.output, "internal error: " + (err.stack || err));
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

        const commandExec = new CommandExecution(this, command);
        commandExec.outputToStringRespond(respond);
        
        this.runCommandExecution(commandExec);
    }

    runCommandChainParsed(chain: CommandChain, respond: RespondFunc) {
        if (chain.commands.length === 0) {
            respond('#done');
            return;
        }

        if (chain.commands.length === 1)
            return this.runCommandParsed(chain.commands[0], respond);

        const output = receiveToStringRespond(this, chain.commands[0], respond);
        runCommandChain(this, chain, output);
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

        if (/^ *\#/.exec(str)) {
            // ignore comments
            return;
        }

        if (!respond) {
            respond = (msg) => {
                if (msg.startsWith('#error')) {
                    console.log(`Uncaught error when running '${str}': ${msg}`);
                }
            }
        }

        const chain = parseCommandChain(str);

        for (const command of chain.commands) {
            if (!command.commandName)
                throw new Error('no command name found: ' + parsedCommandToString(command));
        }

        this.runCommandChainParsed(chain, respond);
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

    getRelationsSync(tags: string): Relation[] {
        let rels: Relation[] = null;
        const commandStr = 'get ' + tags;
        const parsedCommand = parseCommand(commandStr);
        const commandExec = new CommandExecution(this, parsedCommand);
        commandExec.outputToRelationList(l => { rels = l });
        const search = commandExec.toRelationSearch();
        search.start();
        runSearch(this, search);
        if (rels === null)
            throw new Error("getRelationsSync search didn't finish synchronously: " + tags);
        return rels;
    }

    getOneRelationSync(tags: string): Relation {
        const rels = this.getRelationsSync(tags);
        if (rels.length === 0)
            throw new Error("no relations found for: " + tags);

        if (rels.length > 1)
            throw new Error("getOneRelationSync found multiple results found for: " + tags);

        return rels[0];
    }

    getOneRelationOptionalSync(tags: string): Relation|null {
        const rels = this.getRelationsSync(tags);
        if (rels.length > 1)
            throw new Error("getOneRelationOptionalSync found multiple results found for: " + tags);

        return rels[0] || null;
    }

    runDerived(callback: (cxt: UpdateContext) => void) {
        const cxt = new UpdateContext(this);
        return callback(cxt);
    }
    
    loadDumpFile(filename: string) {
        const contents = Fs.readFileSync(filename, 'utf8');
        for (const line of contents.split(/\r\n|\r|\n/)) {
            this.run(line);
        }

        /*
        const fileStream = Fs.createReadStream(filename);

        const rl = Readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity
        });
      
        for await (const line of rl) {
            this.run(line);
        }
        */
    }

    loadDump(contents: string) {
        for (const line of contents.split(/\r\n|\r|\n/)) {
            this.run(line);
        }
    }
    
    saveDumpFile(filename: string) {
        const contents = (this.runSync('dump') as string[]).join('\n');
        Fs.writeFileSync(filename, contents);
    }
}

