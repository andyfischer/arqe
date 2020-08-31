
import { parseCommandChain } from './parseCommand'
import Tuple from './Tuple'
import Stream from './Stream'
import { receiveToTupleList, fallbackReceiver, receiveToTupleListPromise } from './receiveUtils'
import runCompoundQuery from './runCompoundQuery'
import IDSource from './utils/IDSource'
import GraphListener, { GraphListenerMount } from './GraphListenerV3'
import watchAndValidateCommand from './validation/watchAndValidateCommand'
import setupBuiltinTables from './setupBuiltinTables'
import parseObjectToPattern from './parseObjectToPattern'
import CompoundQuery from './CompoundQuery'
import Query from './Query'
import InMemoryTable from './tables/InMemoryTable'
import TuplePatternMatcher from './tuple/TuplePatternMatcher'
import TableListener from './TableListener'
import TableMount from './TableMount'
import parseTuple from './parseTuple'
import { receiveToRelationInStream, receiveToRelationAsync } from './Relation'
import QueryWatch from './QueryWatch'
import setupInMemoryObjectTable from './tables/InMemoryObject'
import { setupSingleValueTable } from './tables/SingleValueTable'
import SavedQuery from './SavedQuery'
import QueryContext from './QueryContext'

interface GraphOptions {
    context?: 'browser' | 'node'
    autoinitMemoryTables?: boolean
}

function looseInputToTuple(input: any): Tuple {
    if (typeof input === 'string') {
        return parseTuple(input);
    } else if (input instanceof Tuple) {
        return input;
    } else {
        return parseObjectToPattern(input);
    }
}

export default class Graph {

    options: GraphOptions

    nextUniquePerAttr: { [ typeName: string]: IDSource } = {};
    tables = new Map<string, TableMount>()
    tablePatternMap = new TuplePatternMatcher<TableMount>();

    listeners: GraphListenerMount[] = []

    eagerValueIds = new IDSource()
    graphListenerIds = new IDSource()
    nextListenerId = new IDSource()
    nextWatchId = new IDSource();

    relationCreatedListeners: { pattern: Tuple, onCreate: (rel: Tuple) => void }[] = []

    activeWatches = new Map<string, QueryWatch>();

    constructor(options: GraphOptions = {}) {
        this.options = options;
        if (this.options.context === undefined)
            this.options.context = 'node';
        if (this.options.autoinitMemoryTables === undefined)
            this.options.autoinitMemoryTables = true;

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

        if (!(table instanceof TableMount))
            throw new Error('addTable expected TableMount object');

        this.tables.set(table.name, table);
        this.tablePatternMap.add(table.schema, table);
        return table;
    }

    addTables(tables: TableMount[]) {
        for (const table of tables)
            this.addTable(table);
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
        /*
        const table = findTableForQuery(this, tuple);
        if (!tuple) {
            throw new Error("didn't find a single table for: " + tuple.str());
        }
        */

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

        if (!output)
            output = fallbackReceiver(commandStr);

        output = watchAndValidateCommand(commandStr, output);

        const chain = parseCommandChain(commandStr);
        runCompoundQuery(this, chain, output);
    }


    runSync(commandStr: string): Tuple[] {
        return this.runCommandChainSync(commandStr);
    }

    runAsync(commandStr: string): Promise<Tuple[]> {
        const [ receiver, promise ] = receiveToTupleListPromise();
        this.run(commandStr, receiver);
        return promise;
    }

    runCommandChainSync(commandStr: string): Tuple[] {
        const chain = parseCommandChain(commandStr);

        let rels: Tuple[] = null;

        const receiver = receiveToTupleList(r => {
            rels = r
        });

        runCompoundQuery(this, chain, receiver);

        if (rels === null)
            throw new Error("command didn't finish synchronously: " + commandStr);

        return rels;
    }

    get(patternInput: any, receiver: Stream) {
        const pattern = looseInputToTuple(patternInput);
        runCompoundQuery(this, new CompoundQuery([new Query('get', pattern, {})]), receiver);
    }

    set(patternInput: any, receiver: Stream) {
        let pattern: Tuple;
        if (typeof patternInput === 'string') {
            pattern = parseTuple(patternInput);
        } else {
            pattern = parseObjectToPattern(patternInput);
        }

        runCompoundQuery(this, new CompoundQuery([new Query('set', pattern, {})]), receiver);
    }

    setAsync(patternInput: any): Promise<Tuple[]> {
        const [ receiver, promise ] = receiveToTupleListPromise();
        this.set(patternInput, receiver);
        return promise;
    }

    sendRelationValue(searchPattern: Tuple, out: Stream, attrName: string) {
        this.get(searchPattern, receiveToRelationInStream(out, attrName));
    }

    close() { }

    addWatch(watch: QueryWatch) {
        this.activeWatches.set(watch.id, watch);
    }

    mountMapBackedTable(name: string, baseKey: Tuple, keyAttr: string, valueAttr: string): Map<any,any> {
        const { map, table } = setupInMemoryObjectTable({ name, baseKey, keyAttr, valueAttr })
        this.addTable(table);
        return map;
    }

    mountSingleValueTable(name: string, base: Tuple | string, valueAttr: string) {
        if (typeof base === 'string')
            base = parseTuple(base);
        const { accessor, table } = setupSingleValueTable(name, base, valueAttr);
        this.addTable(table);
        return accessor;
    }

    getRelationAsync(patternInput: any) {
        const { stream, promise } = receiveToRelationAsync();
        this.get(patternInput, stream);
        return promise;
    }

    query(patternStr: string) {
        return new SavedQuery(this, parseTuple(patternStr));
    }
}