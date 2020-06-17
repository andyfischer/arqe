
import { parseCommandChain } from './parseCommand'
import Pattern from './Pattern'
import Tuple from './Tuple'
import SavedQuery from './SavedQuery'
import EagerValue from './EagerValue'
import { UpdateFn } from './UpdateContext'
import Stream from './Stream'
import { receiveToTupleList, fallbackReceiver, receiveToTupleListPromise } from './receiveUtils'
import runCommandChain from './runCommandChain'
import UpdateContext from './UpdateContext'
import IDSource from './utils/IDSource'
import receiveToStringList from './receiveToStringList'
import GraphListener, { GraphListenerMount } from './GraphListenerV3'
import { parsePattern } from './parseCommand'
import watchAndValidateCommand from './watchAndValidateCommand'
import StorageProvider from './StorageProvider'
import TupleStore from './TupleStore'
import Column from './Column'
import getBuiltinViews from './getBuiltinViews'
import parseObjectToPattern from './parseObjectToPattern'
import CommandChain from './CommandChain'
import Command from './Command'
import QueryPlan, { QueryTag } from './QueryPlan'
import maybeCreateImplicitTable from './maybeCreateImplicitTable'
import PatternTag, { newTag } from './PatternTag'
import { combineStreams } from './StreamUtil'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import { GenericStream, StreamCombine } from './TableInterface'
import Table from './Table'
import TableInterface from './TableInterface'
import TuplePatternMatcher from './TuplePatternMatcher'

function toInitialization(rel: Tuple) {
    return rel.remapTags((tag: PatternTag) => {
        if (tag.valueExpr && tag.valueExpr[0] === 'set')
            return tag.setValue(tag.valueExpr[1]);
        return tag;
    });
}

export default class Graph {

    nextUniquePerAttr: { [ typeName: string]: IDSource } = {};
    tables = new Map<string, TableInterface>()
    tablePatternMap = new TuplePatternMatcher<TableInterface>();

    listeners: GraphListenerMount[] = []

    savedQueries: SavedQuery[] = []
    savedQueryMap: { [queryStr:string]: SavedQuery } = {}

    eagerValueIds = new IDSource()
    graphListenerIds = new IDSource()
    storageProvidersV3: StorageProvider[] = []

    relationCreatedListeners: { pattern: Pattern, onCreate: (rel: Tuple) => void }[] = []

    tupleStore: TupleStore

    // deprecated:
    columns: { [name: string]: Column } = {}

    constructor() {
        this.tupleStore = new TupleStore(this);

        const builtinViews = getBuiltinViews(this);

        for (const name in builtinViews) {
            const column = this.initColumn(name);
            column.storageProvider = builtinViews[name];
        }
    }

    initColumn(name: string) {

        if (!this.columns[name])
            this.columns[name] = new Column(name);

        return this.columns[name];
    }

    findTable(name: string): TableInterface {
        return this.tables.get(name) || null;
    }

    defineInMemoryTable(name: string, pattern: Pattern) {
        if (this.tables.has(name))
            throw new Error("table already exists: " + name)

        const table = new Table(name, pattern);
        this.tables.set(name, table);
        this.tablePatternMap.add(pattern, table);
        return table;
    }

    resolveExpressionValuesForInsert(rel: Tuple) {
        return rel.remapTags((tag: PatternTag) => {
            if (tag.valueExpr && tag.valueExpr[0] === 'unique') {
                if (!this.nextUniquePerAttr[tag.attr])
                    this.nextUniquePerAttr[tag.attr] = new IDSource();

                return tag.setValue(this.nextUniquePerAttr[tag.attr].take());
            }

            return tag;
        });
    }

    scan(plan: QueryPlan, out: GenericStream<{table: Table, slotId: string, tuple: Tuple}>) {
        const searchPattern = plan.filterPattern || plan.tuple;
        if (!searchPattern)
            throw new Error('missing filterPattern or tuple');

        const combined = new StreamCombine<{table, slotId, tuple}>(out);
        const iteratedTables = combined.receive();

        for (const table of plan.searchTables) {
            const tableOut = combined.receive();

            table.scan({
                receive({slotId, tuple}) {
                    if (searchPattern.isSupersetOf(tuple))
                        tableOut.receive({ table, slotId, tuple });
                },
                finish() {
                    tableOut.finish();
                }
            });
        }

        iteratedTables.finish();
    }

    insert(plan: QueryPlan) {
        const { output } = plan; 

        // Save as new row
        plan.tuple = this.resolveExpressionValuesForInsert(plan.tuple);

        for (const tag of plan.tuple.tags) {
            if (tag.valueExpr) {
                emitCommandError(output, "TupleStore unhandled expression: " + tag.stringify());
                output.done();
                return;
            }
        }

        // Check if this tuple is already saved.
        let found = false;
        this.scan(plan, {
            receive() {
                // Already saved - No-op.
                if (!found) {
                    found = true;
                    output.next(plan.tuple);
                    output.done();
                }
            },
            finish: () => {
                if (!found) {
                    // Not saved, insert
                    this.insertConfirmedNotExists(plan);
                }
            }
        });
    }

    insertConfirmedNotExists(plan: QueryPlan) {

        const graph = this;
        const { output } = plan; 

        // Store a new tuple.
        const table = plan.table;

        if (!plan.table)
            throw new Error("Internal error, missing table in insert()")

        if (!plan.tableName) {
            emitCommandError(output, "internal error, query plan must have 'tableName' for an insert: " + plan.tuple.stringify());
            output.done();
            return;
        }

        table.insert(plan.tuple, {
            next: output.next,
            done: () => {
                output.next(plan.tuple);
                graph.onTupleUpdated(plan.tuple);
                output.done();
            }
        });
    }

    update(plan: QueryPlan) {
        const { output } = plan;
        const graph = this;

        let hasFoundAny = false;

        // Scan and apply the modificationCallback to every matching slot.

        const addToResult = combineStreams({
            next: output.next,
            done: () => {
                // Check if the plan has 'initializeIfMissing' - this means we must insert the row
                // if no matches were found.
                if (!hasFoundAny && plan.initializeIfMissing) {
                    plan.tuple = toInitialization(plan.tuple);
                    this.insert(plan);
                } else {
                    output.done();
                }
            }
        });

        const scanStream = addToResult();

        this.scan(plan, {
            receive({slotId, table, tuple}) {
                const found = tuple;

                const modified = plan.modificationCallback(found);
                const setOutput = addToResult();

                table.update(slotId, modified, {
                    next() {},
                    done() {
                        graph.onTupleUpdated(modified);
                        hasFoundAny = true;
                        setOutput.next(modified);
                        setOutput.done();
                    }
                });
            },
            finish() {
                scanStream.done();
            }
        });
    }

    doDelete(plan: QueryPlan) {
        const { output } = plan;
        const graph = this;

        const addToOutput = combineStreams(output);

        const scanFinished = addToOutput();

        this.scan(plan, {
            receive({table, slotId, tuple}) {
                const deleteResult = addToOutput();

                table.delete(slotId, {
                    next: deleteResult.next,
                    done() {
                        graph.onTupleDeleted(tuple);
                        output.next(tuple.addTagObj(newTag('deleted')));
                        deleteResult.done()
                    }
                });
            },
            finish() {
                scanFinished.done();
            }
        });
    }

    select(plan: QueryPlan) {
        const { tuple, output } = plan;

        this.scan(plan, {
            receive({tuple}) {
                output.next(tuple);
            },
            finish() {
                output.done();
            }
        });
    }

    save(plan: QueryPlan) {
        
        maybeCreateImplicitTable(this.tupleStore, plan);

        if (plan.isDelete) {
            this.doDelete(plan);
        } else if (plan.modifiesExisting) {
            this.update(plan);
        } else {
            this.insert(plan);
        }
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

    addListener(pattern: Pattern, listener: GraphListener) {
        this.listeners.push({ pattern, listener });
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

        for (const savedQuery of this.savedQueries) {
            const matches = savedQuery.pattern.isSupersetOf(rel);

            if (!matches)
                continue;

            savedQuery.changeToken += 1;
            savedQuery.updateConnectedValues();
        }
    }

    onTupleDeleted(rel: Tuple) {
        for (const entry of this.listeners) {
            if (entry.pattern.isSupersetOf(rel))
                entry.listener.onTupleDeleted(rel);
        }

        for (const savedQuery of this.savedQueries) {
            const matches = savedQuery.pattern.isSupersetOf(rel);

            if (!matches)
                continue;

            savedQuery.changeToken += 1;
            savedQuery.updateConnectedValues();
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

    runDerived(callback: (cxt: UpdateContext) => void) {
        const cxt = new UpdateContext(this);
        return callback(cxt);
    }

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

