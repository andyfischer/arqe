
import Tuple, { jsonToTuple } from './Tuple'
import Stream from './Stream'
import { receiveToTupleList, fallbackReceiver, receiveToTupleListPromise } from './receiveUtils'
import IDSource from './utils/IDSource'
import watchAndValidateCommand from './validation/watchAndValidateCommand'
import setupBuiltinTables from './setupBuiltinTables'
import TuplePatternMatcher from './tuple/TuplePatternMatcher'
import TableMount, { MountId } from './TableMount'
import parseTuple from './stringFormat/parseTuple'
import { receiveToRelationInStream, receiveToRelationAsync } from './receiveUtils'
import { setupSingleValueTable } from './tables/SingleValueTable'
import Query, { runQuery, queryFromOneTuple } from './Query'
import LiveQuery from './LiveQuery'
import QueryContext from './QueryContext'
import { VerbCallback } from './runOneCommand'
import { QueryLike, toQuery, TupleLike, toTuple } from './coerce'
import setupTableSet, { TableSetDefinition } from './setupTableSet'
import Relation from './Relation'
import Pipe from './Pipe'
import findPartitionsByTable from './findPartitionsByTable'
import TableDefiner from './TableDefiner'
import { randInt } from './utils/rand'
import { toCapitalCase } from './utils/naming'

interface GraphOptions {
    context?: 'browser' | 'node'
    provide?: TableSetDefinition
}

export default class Graph {

    options: GraphOptions

    nextUniquePerAttr: { [ typeName: string]: IDSource } = {};

    tablesByName = new Map<string, TableMount>()
    tablesById = new Map<MountId, TableMount>()

    tablePatternMap = new TuplePatternMatcher<TableMount>();

    nextMountId = new IDSource('mount-');
    nextLiveQueryId = new IDSource('lq-');
    nextAnonTableNameId = new IDSource();

    liveQueries = new Map<string, LiveQuery>()
    pendingChangeEvents = new Map<string, true>();
    _isFlushingChangeEvents = false;

    definedVerbs: { [name: string]: VerbCallback } = {}

    constructor(options: GraphOptions = {}) {
        this.options = options;
        if (this.options.context === undefined)
            this.options.context = 'node';

        setupBuiltinTables(this);

        if (options.provide) {
            this.addTables(setupTableSet(options.provide));
        }
    }

    /*
    defineInMemoryTable(name: string, pattern: Tuple): TableMount {
        const inMemoryTable = new InMemoryTable(name, pattern);
        this.addTable(inMemoryTable.mount);
        return inMemoryTable.mount;
    }
    */

    *tables() {
        yield* this.tablesById.values();
    }

    findTableByName(name: string) {
        return this.tablesByName.get(name) || null;
    }

    addTable(table: TableMount) {
        if (!table.name)
            table.name = this.getDefaultTableName(table.schema);

        if (!(table instanceof TableMount))
            throw new Error('addTable expected TableMount object');

        if (table.mountId)
            throw new Error("table already has mountId - mounted twice?");

        for (const existingTable of this.tables()) {
            if (table.schema.hasOverlap(existingTable.schema)) {
                throw new Error("Added table has overlap with existing table. "
                                +`Existing: ${existingTable.name} (${existingTable.schema.stringify()}). `
                                +`New: ${table.name} (${table.schema.stringify()}).`);
            }
        }

        table.mountId = this.nextMountId.take();
        this.tablesByName.set(table.name, table);
        this.tablesById.set(table.mountId, table);
        this.tablePatternMap.add(table.schema, table);
        return table;
    }

    addTables(tables: TableMount[]) {
        for (const table of tables)
            this.addTable(table);
    }

    removeTables(tables: TableMount[]) {
        const idsToRemove = new Map<MountId,boolean>();

        for (const table of tables) {
            if (!table.mountId)
                throw new Error('table has no mountId (not mounted?): ' + table.name);

            idsToRemove.set(table.mountId, true)
        }

        for (const [ name, table ] of this.tablesByName.entries()) {
            if (idsToRemove.get(table.mountId))
                this.tablesByName.delete(name);
        }

        for (const [ id, table ] of this.tablesById.entries()) {
            if (idsToRemove.get(id))
                this.tablesById.delete(id);
        }

        this.tablePatternMap.filterEntries((entry: { pattern: Tuple, value: TableMount }) => {
            return !idsToRemove.get(entry.value.mountId);
        });
    }

    getDefaultTableName(schema: Tuple) {
        let out = '';
        for (const tag of schema.tags) {
            if (tag.optional)
                continue
            out += toCapitalCase(tag.attr);
        }

        if (out === '')
            out = 'Table'

        while (this.tablesByName.get(out)) {
            out += randInt(10);
        }

        return out;
    }

    takeNextUniqueIdForAttr(attr: string) {
        if (!this.nextUniquePerAttr[attr])
            this.nextUniquePerAttr[attr] = new IDSource();
        return this.nextUniquePerAttr[attr].take();
    }

    run = (queryLike: QueryLike, output?: Stream): Pipe|null => {
        // output = watchAndValidateCommand(commandStr, output);

        const query = toQuery(queryLike);
        const cxt = new QueryContext(this);

        let pipe;
        if (!output) {
            pipe = new Pipe();
            output = pipe;
        }

        runQuery(cxt, query, output);

        return pipe;
    }

    runCallback(queryLike: QueryLike, callback: (rel: Relation) => void) {
        this.run(queryLike, receiveToTupleList(tuples => callback(new Relation(tuples))));
    }

    runSync(queryLike: QueryLike): Tuple[] {
        const query = toQuery(queryLike);

        let rels: Tuple[] = null;

        const receiver = receiveToTupleList(r => {
            rels = r
        });

        const cxt = new QueryContext(this);
        runQuery(cxt, query, receiver);

        if (rels === null)
            throw new Error("command didn't finish synchronously: " + query.stringify());

        return rels;
    }

    runSyncRelation(queryLike: QueryLike): Relation {
        return new Relation(this.runSync(queryLike));
    }

    runAsync(queryLike: QueryLike): Promise<Tuple[]> {
        const [ receiver, promise ] = receiveToTupleListPromise();
        this.run(toQuery(queryLike), receiver);
        return promise;
    }

    runAndPipe(queryLike: QueryLike): Pipe {
        const pipe = new Pipe();
        this.run(queryLike, pipe);
        return pipe;
    }

    get(patternLike: TupleLike, out: Stream) {
        const pattern = toTuple(patternLike);

        const query = queryFromOneTuple(pattern.setValue('verb', 'get'));
        const cxt = new QueryContext(this);
        runQuery(cxt, query, out);
    }

    set(patternLike: TupleLike, out: Stream) {
        let pattern = toTuple(patternLike);

        const query = queryFromOneTuple(pattern.setValue('verb', 'set'));
        const cxt = new QueryContext(this);
        runQuery(cxt, query, out);
    }

    setAsync(patternInput: any): Promise<Tuple[]> {
        const [ receiver, promise ] = receiveToTupleListPromise();
        this.set(patternInput, receiver);
        return promise;
    }

    sendRelationValue(searchPattern: Tuple, out: Stream, attrName: string) {
        this.get(searchPattern, receiveToRelationInStream(out, attrName));
    }

    /*
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
    */

    getRelationAsync(patternInput: any) {
        const [ stream, promise ] = receiveToRelationAsync();
        this.get(patternInput, stream);
        return promise;
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

    newLiveQuery(queryLike: QueryLike) {
        const query = toQuery(queryLike);
        return new LiveQuery(this, query);
    }

    *findMatchingTables(tuple: TupleLike) {
        for (const [mount, partition] of findPartitionsByTable(this, toTuple(tuple))) {
            yield mount;
        }
    }

    stringifyTables() {
        const out = ['['];
        for (const table of this.tablesByName.values())
             out.push(`${table.mountId}: (${table.schema.stringify()})`);

        out.push(']');
        return out.join('\n');
    }

    defineVerb(name: string, callback: VerbCallback) {
        this.definedVerbs[name] = callback;
    }

    provide(def: TableSetDefinition): TableMount[] {
        const mounts = setupTableSet(def);
        this.addTables(mounts);
        return mounts;
    }

    provideWithDefiner(func: (definer: TableDefiner) => any) {
        const definer = new TableDefiner();
        func(definer);
        definer.mount(this);
    }
}
