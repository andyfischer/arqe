
import Fs from 'fs'
import { parseCommandChain } from './parseCommand'
import Pattern from './Pattern'
import Relation from './Relation'
import runSearch from './runSearch'
import InMemoryStorage from './InMemoryStorage'
import SavedQuery from './SavedQuery'
import StorageMount from './StorageMount'
import EagerValue from './EagerValue'
import { UpdateFn } from './UpdateContext'
import updateFilesystemMounts from './updateFilesystemMounts'
import InheritTags, { updateInheritTags } from './InheritTags'
import TypeInfo from './TypeInfo'
import WebSocketProvider, { updateWebSocketProviders } from './WebSocketProvider'
import RelationReceiver from './RelationReceiver'
import { receiveToRelationList, fallbackReceiver } from './receivers'
import { runCommandChain, singleCommandExecution } from './runCommand'
import UpdateContext from './UpdateContext'
import TagTypeOrdering from './TagTypeOrdering'
import runningInBrowser from './context/runningInBrowser'
import IDSource from './utils/IDSource'
import receiveToStringList from './receiveToStringList'
import { ObjectTypeSpace } from './hooks/ObjectSpace'
import GraphListener, { GraphListenerMount } from './GraphListenerV3'
import { parsePattern } from './parseCommand'
import watchAndValidateCommand from './watchAndValidateCommand'
import ExpireAtListener from './ExpireAtListener'
import { receiveToRelationListPromise } from './receivers'
import SaveSearchHook from './SaveSearchHook'
import { getObjectSpaceHooks } from './hooks/ObjectSpace'
import setupGitHooks from './hooks/Git'
import StorageSlotHook from './StorageSlotHook'
import Slot from './Slot'
import FileChangedLog from './hooks/FileChangedLog'

export default class Graph {

    inMemory = new InMemoryStorage(this)
    objectTypes = new ObjectTypeSpace(this)
    listeners: GraphListenerMount[] = []

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

    saveSearchHooks: SaveSearchHook[] = []
    storageSlotHooks: StorageSlotHook[] = []

    constructor() {
        if (runningInBrowser())
            this.filesystemMounts = this.eagerValue(() => []);
        else
            this.filesystemMounts = this.eagerValue(updateFilesystemMounts);

        this.inheritTags = this.eagerValue(updateInheritTags, new InheritTags());
        this.eagerValue(this.ordering.update);
        this.wsProviders = this.eagerValue(updateWebSocketProviders);
        this.addListener(parsePattern('object-type/* **'), this.objectTypes);
        this.addListener(parsePattern('expires-at/* **'), new ExpireAtListener(this));
        this.saveSearchHooks.push(getObjectSpaceHooks());
        this.saveSearchHooks.push(new FileChangedLog(this));
        this.storageSlotHooks.push(setupGitHooks(this));
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

    addListener(pattern: Pattern, listener: GraphListener) {
        this.listeners.push({ pattern, listener });
    }

    onRelationUpdated(rel: Relation) {

        // console.log('onRelationUpdated: ' + rel.stringify() + ` (${this.listeners.length} listenrers)`);

        for (const entry of this.listeners) {
            if (entry.pattern.matches(rel)) {
                // console.log(' listener matches: ' + entry.pattern.stringify())
                entry.listener.onRelationUpdated(rel);
            } else {
                // console.log(' listener does not match: ' + entry.pattern.stringify())
            }
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
        for (const entry of this.listeners) {
            if (entry.pattern.matches(rel))
                entry.listener.onRelationDeleted(rel);
        }

        for (const savedQuery of this.savedQueries) {
            const matches = savedQuery.pattern.matches(rel);

            if (!matches)
                continue;

            savedQuery.changeToken += 1;
            savedQuery.updateConnectedValues();
        }
    }

    run(commandStr: string, output?: RelationReceiver) {
        if (/^ *\#/.exec(commandStr)) {
            // ignore comments
            return;
        }

        if (!output) {
            output = fallbackReceiver(commandStr);
        }

        output = watchAndValidateCommand(commandStr, output);

        const chain = parseCommandChain(commandStr);
        runCommandChain(this, chain, output);
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

    runDerived(callback: (cxt: UpdateContext) => void) {
        const cxt = new UpdateContext(this);
        return callback(cxt);
    }

    loadDumpFile(filename: string) {
        const contents = Fs.readFileSync(filename, 'utf8');
        for (const line of contents.split(/\r\n|\r|\n/)) {
            if (line.trim() === '')
                continue;

            try {
                this.run(line);
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
            this.run(line);
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

    saveNewRelation(relation: Relation, output: RelationReceiver) {
        for (const hook of this.storageSlotHooks) {
            if (hook.hookPattern(relation)) {
                hook.saveNewRelation(relation, output);
                return
            }
        }

        this.inMemory.saveNewRelation(relation, output);
    }

    getStorageHook(pattern: Pattern) {
        for (const hook of this.storageSlotHooks) {
            if (hook.hookPattern(pattern)) {
                return hook;
            }
        }

        return this.inMemory;
    }

    close() {
    }
}

