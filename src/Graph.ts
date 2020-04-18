
import Command from './Command'
import CommandStep from './CommandStep'
import parseCommand, { parseCommandChain } from './parseCommand'
import Pattern from './Pattern'
import Relation from './Relation'
import runSearch from './runSearch'
import GraphListener from './GraphListener'
import InMemoryStorage from './storage/InMemoryStorage'
import SavedQuery from './SavedQuery'
import StorageMount from './StorageMount'
import EagerValue from './EagerValue'
import { UpdateFn } from './UpdateContext'
import updateFilesystemMounts from './updateFilesystemMounts'
import InheritTags, { updateInheritTags } from './InheritTags'
import TypeInfo from './TypeInfo'
import WebSocketProvider, { updateWebSocketProviders } from './WebSocketProvider'
import RelationReceiver from './RelationReceiver'
import { receiveToRelationList } from './receivers'
import { runCommandChain, singleCommandExecution } from './runCommand'
import { emitCommandError, emitCommandOutputFlags, emitRelationDeleted } from './CommandMeta'
import UpdateContext from './UpdateContext'
import Fs from 'fs'
import TagTypeOrdering from './TagTypeOrdering'
import runningInBrowser from './context/runningInBrowser'
import IDSource from './utils/IDSource'
import GraphListenerV2 from './GraphListenerV2'
import { GraphListenerMountV3 } from './GraphListenerV3'
import { parsePattern } from './parseCommand'
import receiveToStringList from './receiveToStringList'
import { ObjectTypeSpace } from './ObjectSpace'
import GraphListenerV3 from './GraphListenerV3'
import { parsePattern as pattern } from './parseCommand'

export default class Graph {

    inMemory = new InMemoryStorage(this)
    objectTypes = new ObjectTypeSpace(this)
    listeners: GraphListener[] = []
    listenersV3: GraphListenerMountV3[] = []

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
        this.addListenerV3(pattern('object-type/* **'), this.objectTypes);
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

    listen(step: CommandStep) {
        if (step.flags.get) {
            const search = step.toRelationSearch();
            search.finish = () => null;
            runSearch(this, search);
        }

        this.listeners.push({
            onRelationUpdated(rel: Relation) {
                if (step.pattern.matches(rel)) {
                    step.output.relation(rel);
                }
            },
            onRelationDeleted(rel: Relation) {
                if (step.pattern.matches(rel)) {
                    emitRelationDeleted(rel, step.output);
                }
            },
            finish() {
                step.output.finish();
            }
        })
    }

    addListenerV3(pattern: Pattern, listener: GraphListenerV3) {
        this.listenersV3.push({ pattern, listener });
    }

    onRelationCreated(rel: Relation) {
        for (const entry of this.listenersV3) {
            if (entry.pattern.matches(rel)) {
                entry.listener.onRelationCreated(rel);
            }
        }
    }

    onRelationUpdatedV3(rel: Relation) {
        for (const entry of this.listenersV3) {
            if (entry.pattern.matches(rel))
                entry.listener.onRelationUpdated(rel);
        }
    }

    onRelationDeletedV3(rel: Relation) {
        for (const entry of this.listenersV3) {
            if (entry.pattern.matches(rel))
                entry.listener.onRelationDeleted(rel);
        }
    }

    onRelationUpdated(rel: Relation) {

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

        for (const entry of this.listenersV3) {
            if (entry.pattern.matches(rel))
                entry.listener.onRelationDeleted(rel);
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

    runSyncOld(commandStr: string) {
        let result = null;

        const receiver = receiveToStringList(r => { result = r; });
        
        this.run(commandStr, receiver);

        if (result === null)
            throw new Error("command didn't have sync response in runSync");

        return result;
    }

    runSync(commandStr: string): Relation[] {
        return this.runCommandChainSync(commandStr);
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
        const commandExec = singleCommandExecution(this, parsedCommand);
        commandExec.output.waitForAll(l => { rels = l });
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
            if (line.trim() === '')
                continue;

            try {
                this.runSilent(line);
            } catch (e) {
                console.log('Failed on command: ' + line);
            }
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
        const contents = (this.runSyncOld('dump') as string[]).join('\n');
        Fs.writeFileSync(filename, contents);
    }

    static loadFromDumpFile(filename: string) {
        const graph = new Graph();
        graph.loadDumpFile(filename);
        return graph;
    }
}

