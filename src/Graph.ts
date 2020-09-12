
import Tuple from './Tuple'
import Stream from './Stream'
import { receiveToTupleList, fallbackReceiver, receiveToTupleListPromise } from './receiveUtils'
import IDSource from './utils/IDSource'
import GraphListener, { GraphListenerMount } from './GraphListenerV3'
import watchAndValidateCommand from './validation/watchAndValidateCommand'
import setupBuiltinTables from './setupBuiltinTables'
import parseObjectToPattern from './parseObjectToPattern'
import InMemoryTable from './tables/InMemoryTable'
import TuplePatternMatcher from './tuple/TuplePatternMatcher'
import TableListener from './TableListener'
import TableMount from './TableMount'
import parseTuple from './parseTuple'
import { receiveToRelationInStream, receiveToRelationAsync } from './Relation'
import setupInMemoryObjectTable from './tables/InMemoryObject'
import { setupSingleValueTable } from './tables/SingleValueTable'
import SavedQuery from './SavedQuery'
import { parseProgram } from './parseProgram'
import QueryV2, { runQueryV2 } from './QueryV2'
import { string } from 'prop-types'
import LiveQuery from './LiveQuery'

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
    nextMountId = new IDSource('mount-');
    nextLiveQueryId = new IDSource('lq-');

    relationCreatedListeners: { pattern: Tuple, onCreate: (rel: Tuple) => void }[] = []

    liveQueries = new Map<string, LiveQuery>()
    pendingChangeEvents = new Map<string, true>();
    _isFlushingChangeEvents = false;

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

        if (table.mountId)
            throw new Error("table already has mountId - mounted twice?");

        table.mountId = this.nextMountId.take();
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

        const query = parseProgram(commandStr);
        runQueryV2(this, query, output);
    }

    runSync(commandStr: string): Tuple[] {
        const query = parseProgram(commandStr);

        let rels: Tuple[] = null;

        const receiver = receiveToTupleList(r => {
            rels = r
        });

        runQueryV2(this, query, receiver);

        if (rels === null)
            throw new Error("command didn't finish synchronously: " + commandStr);

        return rels;
    }

    runAsync(commandStr: string): Promise<Tuple[]> {
        const [ receiver, promise ] = receiveToTupleListPromise();
        this.run(commandStr, receiver);
        return promise;
    }

    get(patternInput: any, out: Stream) {
        const pattern = looseInputToTuple(patternInput);

        const query = new QueryV2();
        const term = query.addTerm('get', pattern);
        query.setOutput(term);

        runQueryV2(this, query, out);
    }

    set(patternInput: any, out: Stream) {
        let pattern: Tuple;
        if (typeof patternInput === 'string') {
            pattern = parseTuple(patternInput);
        } else {
            pattern = parseObjectToPattern(patternInput);
        }

        const query = new QueryV2();
        const term = query.addTerm('set', pattern);
        query.setOutput(term);

        runQueryV2(this, query, out);
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
        const [ stream, promise ] = receiveToRelationAsync();
        this.get(patternInput, stream);
        return promise;
    }

    query(patternStr: string) {
        return new SavedQuery(this, parseTuple(patternStr));
    }

    pushChangeEvent(liveQueryId: string) {
        if (this._isFlushingChangeEvents)
            throw new Error("don't push change event while flushPendingChangeEvents is running");

        this.pendingChangeEvents.set(liveQueryId, true);
    }

    flushPendingChangeEvents() {
        if (this._isFlushingChangeEvents)
            return;

        this._isFlushingChangeEvents = true;
        try {
            for (const queryId of this.pendingChangeEvents.keys()) {
                const liveQuery:LiveQuery = this.liveQueries.get(queryId);
                liveQuery.events.emit('change');
            }
            this.pendingChangeEvents.clear();
        } finally {
            this._isFlushingChangeEvents = false;
        }
    }

    newLiveQuery(queryStr: string) {
        const query = parseProgram(queryStr);
        return new LiveQuery(this, query);
    }
}
