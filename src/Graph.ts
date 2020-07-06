
import { parseCommandChain } from './parseCommand'
import Pattern from './Pattern'
import Tuple from './Tuple'
//import SavedQuery from './SavedQuery'
//import EagerValue from './EagerValue'
//import { UpdateFn } from './UpdateContext'
import Stream from './Stream'
import { receiveToTupleList, fallbackReceiver, receiveToTupleListPromise } from './receiveUtils'
import runCommandChain from './runCommandChain'
//import UpdateContext from './UpdateContext'
import IDSource from './utils/IDSource'
import receiveToStringList from './receiveToStringList'
import GraphListener, { GraphListenerMount } from './GraphListenerV3'
import { parsePattern } from './parseCommand'
import watchAndValidateCommand from './watchAndValidateCommand'
import StorageProvider from './StorageProvider'
import Column from './Column'
import setupBuiltinTables from './setupBuiltinTables'
import parseObjectToPattern from './parseObjectToPattern'
import CommandChain from './CommandChain'
import Command from './Command'
import QueryPlan, { QueryTag } from './QueryPlan'
import maybeCreateImplicitTable from './maybeCreateImplicitTable'
import PatternTag, { newTag } from './PatternTag'
import { combineStreams } from './StreamUtil'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import GenericStream, { StreamCombine } from './GenericStream'
import InMemoryTable from './InMemoryTable'
import TableInterface from './TableInterface'
import TuplePatternMatcher from './TuplePatternMatcher'
import TableListener from './TableListener'
import findTableForQuery from './findTableForQuery'
import TableMount from './TableMount'

export default class Graph {

    nextUniquePerAttr: { [ typeName: string]: IDSource } = {};
    tables = new Map<string, TableMount>()
    tablePatternMap = new TuplePatternMatcher<TableMount>();

    listeners: GraphListenerMount[] = []

    //savedQueries: SavedQuery[] = []
    //savedQueryMap: { [queryStr:string]: SavedQuery } = {}

    eagerValueIds = new IDSource()
    graphListenerIds = new IDSource()
    storageProvidersV3: StorageProvider[] = []
    nextListenerId = new IDSource()

    relationCreatedListeners: { pattern: Pattern, onCreate: (rel: Tuple) => void }[] = []

    // deprecated:
    columns: { [name: string]: Column } = {}

    constructor() {
        setupBuiltinTables(this);
    }

    initColumn(name: string) {

        if (!this.columns[name])
            this.columns[name] = new Column(name);

        return this.columns[name];
    }

    findTable(name: string) {
        return this.tables.get(name) || null;
    }

    defineInMemoryTable(name: string, pattern: Pattern) {
        if (this.tables.has(name))
            throw new Error("table already exists: " + name)

        const tableStorage = new InMemoryTable(name, pattern);
        const mount = new TableMount(name, pattern, tableStorage);
        this.tables.set(name, mount);
        this.tablePatternMap.add(pattern, mount);
        return mount;
    }

    defineVirtualTable(name: string, pattern: Tuple, storage: TableInterface) {
        if (!name)
            throw new Error("missing 'name'");
        if (this.tables.has(name))
            throw new Error("table already exists: " + name)

        const mount = new TableMount(name, pattern, storage);
        this.tables.set(name, mount);
        this.tablePatternMap.add(pattern, mount);
        return mount;
    }

    takeNextUniqueIdForAttr(attr: string) {
        if (!this.nextUniquePerAttr[attr])
            this.nextUniquePerAttr[attr] = new IDSource();
        return this.nextUniquePerAttr[attr].take();
    }

    /*
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
    */

    addListener(pattern: Pattern, listener: GraphListener) {
        this.listeners.push({ pattern, listener });
    }

    addListenerV2(tuple: Tuple, listener: TableListener) {
        const table = findTableForQuery(this, tuple);
        if (!tuple) {
            throw new Error("didn't find a single table for: " + tuple.str());
        }

        const id = this.nextListenerId.take();
        if (!table.storage.addListener)
            throw new Error(`${table.storage.name} doesn't support listeners`);

        table.storage.addListener(id, listener);
        return id;
    }

    onTupleCreated(rel: Tuple) {
        for (const { pattern, onCreate } of this.relationCreatedListeners)
            if (rel.isSupersetOf(pattern))
                onCreate(rel);
    }

    onTupleUpdated(rel: Tuple) {

        // console.log('onRelationUpdated: ' + rel.stringify() + ` (${this.listeners.length} listenrers)`);

        for (const entry of this.listeners) {
            if (entry.pattern.isSupersetOf(rel)) {
                // console.log(' listener isSupersetOf: ' + entry.pattern.stringify())
                entry.listener.onTupleUpdated(rel);
            } else {
                // console.log(' listener does not match: ' + entry.pattern.stringify())
            }
        }

        /*
        for (const savedQuery of this.savedQueries) {
            const matches = savedQuery.pattern.isSupersetOf(rel);

            if (!matches)
                continue;

            savedQuery.changeToken += 1;
            savedQuery.updateConnectedValues();
        }
        */
    }

    onTupleDeleted(rel: Tuple) {
        for (const entry of this.listeners) {
            if (entry.pattern.isSupersetOf(rel))
                entry.listener.onTupleDeleted(rel);
        }

        /*
        for (const savedQuery of this.savedQueries) {
            const matches = savedQuery.pattern.isSupersetOf(rel);

            if (!matches)
                continue;

            savedQuery.changeToken += 1;
            savedQuery.updateConnectedValues();
        }
        */
    }

    run(commandStr: string, output?: Stream) {

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

    runSync(commandStr: string): Tuple[] {
        return this.runCommandChainSync(commandStr);
    }

    runAsync(commandStr: string): Promise<Tuple[]> {
        const { receiver, promise } = receiveToTupleListPromise();
        this.run(commandStr, receiver);
        return promise;
    }

    runCommandChainSync(commandStr: string): Tuple[] {
        const chain = parseCommandChain(commandStr);

        let rels: Tuple[] = null;

        const receiver = receiveToTupleList(r => {
            rels = r
        });

        runCommandChain(this, chain, receiver);

        if (rels === null)
            throw new Error("command didn't finish synchronously: " + commandStr);

        return rels;
    }

    /*
    runDerived(callback: (cxt: UpdateContext) => void) {
        const cxt = new UpdateContext(this);
        return callback(cxt);
    }
    */

    get(patternInput: any, receiver: Stream) {
        let pattern: Pattern;
        if (typeof patternInput === 'string') {
            pattern = parsePattern(patternInput);
        } else {
            pattern = parseObjectToPattern(patternInput);
        }

        runCommandChain(this, new CommandChain([new Command('get', pattern, {})]), receiver);
    }

    set(patternInput: any, receiver: Stream) {
        let pattern: Pattern;
        if (typeof patternInput === 'string') {
            pattern = parsePattern(patternInput);
        } else {
            pattern = parseObjectToPattern(patternInput);
        }

        runCommandChain(this, new CommandChain([new Command('set', pattern, {})]), receiver);
    }

    setAsync(patternInput: any): Promise<Tuple[]> {
        const { receiver, promise } = receiveToTupleListPromise();
        this.set(patternInput, receiver);
        return promise;
    }

    close() { }
}

