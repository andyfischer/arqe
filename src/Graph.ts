
import { parseCommandChain } from './parseCommand'
import Tuple from './Tuple'
import Stream from './Stream'
import { receiveToTupleList, fallbackReceiver, receiveToTupleListPromise } from './receiveUtils'
import runCommandChain from './runCommandChain'
import IDSource from './utils/IDSource'
import receiveToStringList from './receiveToStringList'
import GraphListener, { GraphListenerMount } from './GraphListenerV3'
import watchAndValidateCommand from './watchAndValidateCommand'
import setupBuiltinTables from './setupBuiltinTables'
import parseObjectToPattern from './parseObjectToPattern'
import CommandChain from './CommandChain'
import Command from './Command'
import InMemoryTable from './InMemoryTable'
import TuplePatternMatcher from './TuplePatternMatcher'
import TableListener from './TableListener'
import findTableForQuery from './findTableForQuery'
import TableMount from './TableMount'
import parseTuple from './parseTuple'

export default class Graph {

    nextUniquePerAttr: { [ typeName: string]: IDSource } = {};
    tables = new Map<string, TableMount>()
    tablePatternMap = new TuplePatternMatcher<TableMount>();

    listeners: GraphListenerMount[] = []

    eagerValueIds = new IDSource()
    graphListenerIds = new IDSource()
    nextListenerId = new IDSource()

    relationCreatedListeners: { pattern: Tuple, onCreate: (rel: Tuple) => void }[] = []

    constructor() {
        setupBuiltinTables(this);
    }

    findTable(name: string) {
        return this.tables.get(name) || null;
    }

    defineInMemoryTable(name: string, pattern: Tuple): TableMount {
        if (this.tables.has(name))
            throw new Error("table already exists: " + name)

        const inMemoryTable = new InMemoryTable(name, pattern);
        this.addTable(inMemoryTable.mount);
        return inMemoryTable.mount;
    }

    addTable(table: TableMount) {
        if (!table.name)
            throw new Error("missing 'name'");

        this.tables.set(table.name, table);
        this.tablePatternMap.add(table.schema, table);
        return table;
    }

    takeNextUniqueIdForAttr(attr: string) {
        if (!this.nextUniquePerAttr[attr])
            this.nextUniquePerAttr[attr] = new IDSource();
        return this.nextUniquePerAttr[attr].take();
    }

    addListener(pattern: Tuple, listener: GraphListener) {
        this.listeners.push({ pattern, listener });
    }

    addListenerV2(tuple: Tuple, listener: TableListener) {
        const table = findTableForQuery(this, tuple);
        if (!tuple) {
            throw new Error("didn't find a single table for: " + tuple.str());
        }

        const id = this.nextListenerId.take();
        /*
        FIXME
        if (!table.storage.addListener)
            throw new Error(`${table.storage.name} doesn't support listeners`);

        table.storage.addListener(id, listener);
        */
        return id;
    }

    onTupleCreated(rel: Tuple) {
        for (const { pattern, onCreate } of this.relationCreatedListeners)
            if (rel.isSupersetOf(pattern))
                onCreate(rel);
    }

    onTupleUpdated(rel: Tuple) {

        for (const entry of this.listeners) {
            if (entry.pattern.isSupersetOf(rel)) {
                // console.log(' listener isSupersetOf: ' + entry.pattern.stringify())
                entry.listener.onTupleUpdated(rel);
            } else {
                // console.log(' listener does not match: ' + entry.pattern.stringify())
            }
        }
    }

    onTupleDeleted(rel: Tuple) {
        for (const entry of this.listeners) {
            if (entry.pattern.isSupersetOf(rel))
                entry.listener.onTupleDeleted(rel);
        }
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

    get(patternInput: any, receiver: Stream) {
        let pattern: Tuple;
        if (typeof patternInput === 'string') {
            pattern = parseTuple(patternInput);
        } else {
            pattern = parseObjectToPattern(patternInput);
        }

        runCommandChain(this, new CommandChain([new Command('get', pattern, {})]), receiver);
    }

    set(patternInput: any, receiver: Stream) {
        let pattern: Tuple;
        if (typeof patternInput === 'string') {
            pattern = parseTuple(patternInput);
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

