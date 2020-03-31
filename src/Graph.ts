
import Command from './Command'
import CommandChain from './CommandChain'
import CommandExecution from './CommandExecution'
import parseCommand, { parseCommandChain } from './parseCommand'
import Relation from './Relation'
import { runSearch } from './Search'
import GraphListener from './GraphListener'
import Pattern from './Pattern'
import collectRespond from './collectRespond'
import InMemoryStorage from './InMemoryStorage'
import SavedQuery from './SavedQuery'
import StorageMount from './StorageMount'
import EagerValue from './EagerValue'
import { UpdateFn } from './UpdateContext'
import updateFilesystemMounts from './updateFilesystemMounts'
import InheritTags, { updateInheritTags } from './InheritTags'
import TypeInfo from './TypeInfo'
import WebSocketProvider, { updateWebSocketProviders } from './WebSocketProvider'
import RelationReceiver, { receiveToRelationList } from './RelationReceiver'
import { runCommandChain } from './ChainedExecution'
import { emitSearchPatternMeta, emitCommandError, emitActionPerformed, emitCommandOutputFlags } from './CommandMeta'
import UpdateContext from './UpdateContext'
import Fs from 'fs'
import TagTypeOrdering from './TagTypeOrdering'
import runningInBrowser from './context/runningInBrowser'
import IDSource from './IDSource'
import GraphListenerV2 from './GraphListenerV2'
import { parsePattern } from './parseCommand'
import { runSetOperation } from './SetOperation'
import receiveToStringList from './receiveToStringList'

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

    eagerValueIds = new IDSource()
    graphListenerIds = new IDSource()
    graphListenersV2: { [id: string]: GraphListenerV2 } = {}

    constructor() {
        if (runningInBrowser())
            this.filesystemMounts = this.eagerValue(() => []);
        else
            this.filesystemMounts = this.eagerValue(updateFilesystemMounts);

        this.inheritTags = this.eagerValue(updateInheritTags, new InheritTags());
        this.eagerValue(this.ordering.update);
        this.wsProviders = this.eagerValue(updateWebSocketProviders);
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

        emitActionPerformed(commandExec.output);
        commandExec.output.finish();
    }

    listen(commandExec: CommandExecution) {
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

        emitCommandOutputFlags(commandExec.command, commandExec.output);

        if (commandExec.start) {
            commandExec.start();
            return;
        }

        try {
            switch (commandExec.commandName) {

            case 'set': {
                runSetOperation(this, commandExec);
                return;
            }

            case 'get': {
                const search = commandExec.toRelationSearch();
                emitSearchPatternMeta(commandExec.command.toPattern(), search);
                runSearch(this, search);
                return;
            }

            case 'modify': {
                return;
            }

            case 'dump': {
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

            emitCommandError(commandExec.output, "unrecognized command: " + commandExec.commandName);
            commandExec.output.finish();

        } catch (err) {
            console.log(err.stack || err);
            emitCommandError(commandExec.output, "internal error: " + (err.stack || err));
            commandExec.output.finish();
        }
    }

    onRelationUpdated(command: Command, rel: Relation) {

        for (const listener of this.listeners)
            listener.onRelationUpdated(rel);

        for (const id in this.graphListenersV2) {
            const listener = this.graphListenersV2[id];
            if (listener.pattern.matches(rel))
                listener.trigger();
        }

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

        for (const id in this.graphListenersV2) {
            const listener = this.graphListenersV2[id];
            if (listener.pattern.matches(rel))
                listener.trigger();
        }

        for (const savedQuery of this.savedQueries) {
            if (savedQuery.pattern.matches(rel)) {
                savedQuery.changeToken += 1;
                savedQuery.updateConnectedValues();
            }
        }
    }

    run(str: string, output: RelationReceiver) {
        if (/^ *\#/.exec(str)) {
            // ignore comments
            return;
        }

        const chain = parseCommandChain(str);
        runCommandChain(this, chain, output);
    }

    runSilent(str: string) {
        let error = null;

        this.run(str, {
            relation(rel) {
                if (rel.hasType('command-meta') && rel.hasType('error')) {
                    console.log('error: ' + rel.getPayload());
                    error = error || rel;
                }
            },
            isDone() { return false; },
            finish() { }
        });

        if (error)
            throw new Error(error.getPayload())
    }

    runSync(commandStr: string) {
        let result = null;

        const receiver = receiveToStringList(r => { result = r; });
        
        this.run(commandStr, receiver);

        if (result === null)
            throw new Error("command didn't have sync response in runSync");

        return result;
    }

    runCommandChainSync(commandStr: string): Relation[] {
        const chain = parseCommandChain(commandStr);

        let rels: Relation[] = null;

        const receiver = receiveToRelationList(r => {
            rels = r
        });

        runCommandChain(this, chain, receiver);

        if (rels === null)
            throw new Error("command didn't finish synchronously: " + commandStr);

        return rels;
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

    addListener(patternStr: string, callback: () => void) {
        if (typeof callback !== 'function')
            throw new Error('expected callback function');

        return new GraphListenerV2(this, parsePattern(patternStr), callback);
    }
    
    loadDumpFile(filename: string) {
        const contents = Fs.readFileSync(filename, 'utf8');
        for (const line of contents.split(/\r\n|\r|\n/)) {
            this.runSilent(line);
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
            this.runSilent(line);
        }
    }
    
    saveDumpFile(filename: string) {
        const contents = (this.runSync('dump') as string[]).join('\n');
        Fs.writeFileSync(filename, contents);
    }

    static loadFromDumpFile(filename: string) {
        const graph = new Graph();
        graph.loadDumpFile(filename);
        return graph;
    }
}

