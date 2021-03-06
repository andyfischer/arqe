
import Tuple, { jsonToTuple } from './Tuple'
import Stream from './Stream'
import { receiveToTupleList } from './receiveUtils'
import IDSource from './utils/IDSource'
import watchAndValidateCommand from './validation/watchAndValidateCommand'
import setupBuiltinTables from './setupBuiltinTables'
import TableMount, { MountId } from './TableMount'
import parseTuple from './stringFormat/parseTuple'
import Query from './Query'
import { runQuery } from './runQuery'
import LiveQuery from './LiveQuery'
import QueryContext from './QueryContext'
import { QueryLike, toQuery, TupleLike, toTuple } from './coerce'
import parseTableDefinition, { TableSetDefinition } from './parseTableDefinition'
import Relation, { newRelation } from './Relation'
import Pipe, { newNullPipe } from './Pipe'
import findTablesForPattern from './findTablesForPattern'
import TableDefiner from './TableDefiner'
import { randInt } from './utils/rand'
import { toCapitalCase } from './utils/naming'
import MemoryTable from './MemoryTable'

export interface GraphOptions {
    provide?: TableSetDefinition
}

export default class Graph {

    options: GraphOptions

    nextUniquePerAttr: { [ typeName: string]: IDSource } = {};

    tablesByName = new Map<string, TableMount>()
    tablesById = new Map<MountId, TableMount>()

    nextMountId = new IDSource('mount-');
    nextLiveQueryId = new IDSource('lq-');
    nextAnonTableNameId = new IDSource();

    liveQueries = new Map<string, LiveQuery>()
    pendingChangeEvents = new Map<string, true>();
    _isFlushingChangeEvents = false;

    memoryTable = new MemoryTable()

    constructor(options: GraphOptions = {}) {
        this.options = options;
        setupBuiltinTables(this);

        if (options.provide) {
            this.addTables(parseTableDefinition(options.provide));
        }
    }

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

        /*
        for (const existingTable of this.tables()) {
            if (table.schema.hasOverlap(existingTable.schema)) {
                throw new Error("Added table has overlap with existing table. "
                                +`Existing: ${existingTable.name} (${existingTable.schema.stringify()}). `
                                +`New: ${table.name} (${table.schema.stringify()}).`);
            }
        }*/

        table.mountId = this.nextMountId.take();
        this.tablesByName.set(table.name, table);
        this.tablesById.set(table.mountId, table);
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

    newScope() {
        return new QueryContext(this);
    }

    run = (queryLike: QueryLike, output?: Stream): Pipe|null => {
        // output = watchAndValidateCommand(commandStr, output);

        const query = toQuery(queryLike);
        const cxt = new QueryContext(this);

        let pipe;

        // console.log(`run(${queryLike}) calling runQuery`, output)

        const result = runQuery(cxt, query, newNullPipe())

        if (output)
            result.sendTo(output);

        return result;
    }

    runSync(queryLike: QueryLike): Tuple[] {
        const query = toQuery(queryLike);

        let rels: Tuple[] = null;

        const receiver = receiveToTupleList(r => {
            rels = r
        });

        const cxt = new QueryContext(this);
        runQuery(cxt, query, newNullPipe())
        .sendTo(receiver);

        if (rels === null)
            throw new Error("command didn't finish synchronously: " + query.stringify());

        return rels;
    }

    get(patternLike: TupleLike, out: Stream) {
        const pattern = toTuple(patternLike);

        const query = newRelation([pattern.setValue('verb', 'get')]);
        const cxt = new QueryContext(this);
        runQuery(cxt, query, newNullPipe())
        .sendTo(out);
    }

    set(patternLike: TupleLike, out: Stream) {
        let pattern = toTuple(patternLike);

        const query = newRelation([pattern.setValue('verb', 'set')]);
        const cxt = new QueryContext(this);
        runQuery(cxt, query, newNullPipe())
        .sendTo(out);
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
        for (const [mount, partition] of findTablesForPattern(this, toTuple(tuple))) {
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

    provide(def: TableSetDefinition): TableMount[] {
        const mounts = parseTableDefinition(def);
        this.addTables(mounts);
        return mounts;
    }

    provideWithDefiner(func: (definer: TableDefiner) => any) {
        const definer = new TableDefiner();
        func(definer);
        definer.mount(this);
    }
}
