
import Tuple from './Tuple'
import Pattern from './Pattern'
import PatternTag, { newTag } from './PatternTag'
import SearchOperation from './SearchOperation'
import Stream from './Stream'
import Graph from './Graph'
import { emitCommandError, emitCommandOutputFlags } from './CommandMeta'
import IDSource from './utils/IDSource'
import { newTagFromObject } from './PatternTag'
import QueryPlan, { QueryTag } from './QueryPlan'
import Table from './Table'
import { parsePattern } from './parseCommand'
import TuplePatternMatcher from './TuplePatternMatcher'
import maybeCreateImplicitTable from './maybeCreateImplicitTable'
import { GenericStream, StreamCombine } from './TableInterface'
import { combineStreams } from './StreamUtil'

function isThenable(result: any) {
    return result.then !== undefined;
}

function toInitialization(rel: Tuple) {
    return rel.remapTags((tag: PatternTag) => {
        if (tag.valueExpr && tag.valueExpr[0] === 'set')
            return tag.setValue(tag.valueExpr[1]);
        return tag;
    });
}

export default class TupleStore {
    graph: Graph

    nextUniquePerAttr: { [ typeName: string]: IDSource } = {};
    nextSlotId: IDSource = new IDSource();

    _tables = new Map<string, Table>()
    tablePatternMap = new TuplePatternMatcher<Table>();

    constructor(graph: Graph) {
        this.graph = graph;

        this.defineTable('table_schema', parsePattern("table(*) schema"));
    }

    findTable(name: string): Table {
        return this._tables.get(name) || null;
    }

    defineTable(name: string, pattern: Pattern) {
        if (this._tables.has(name))
            throw new Error("table already exists: " + name)

        const table = new Table(name, pattern);
        this._tables.set(name, table);
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

        const slotId = table.nextSlotId.take();
        table.set(slotId, plan.tuple, {
            next: output.next,
            done: () => {
                output.next(plan.tuple);
                this.graph.onTupleUpdated(plan.tuple);
                output.done();
            }
        });
    }

    update(plan: QueryPlan) {
        const { output } = plan;
        const graph = this.graph;

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

                table.set(slotId, modified, {
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
        const graph = this.graph;

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
        
        maybeCreateImplicitTable(this, plan);

        if (plan.isDelete) {
            this.doDelete(plan);
        } else if (plan.modifiesExisting) {
            this.update(plan);
        } else {
            this.insert(plan);
        }
    }
}
