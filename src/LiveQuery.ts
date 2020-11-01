
import Query, { TermId, runQueryV2 } from './Query'
import Graph from './Graph'
import { MountId } from './TableMount'
import Tuple from './Tuple';
import QueryContext from './QueryContext';
import findPartitionsByTable from './findPartitionsByTable';
import { EventEmitter } from 'events';
import Stream from './Stream';
import Relation from './Relation'
import { receiveToRelationSync, receiveToRelationAsync,
    receiveToRelationCallback} from './receiveUtils';
import { toQuery, QueryLike } from './coerce'

export type LiveQueryId = string;

export default class LiveQuery {
    liveQueryId: string
    graph: Graph
    query: Query

    isRunning = false
    isClosed = false
    events = new EventEmitter()

    dynamicListens = new Map<MountId, true>()
    newDynamicListens = new Map<MountId, true>()

    constructor(graph: Graph, queryLike: QueryLike) {
        this.graph = graph;
        this.query = toQuery(queryLike);
        this.liveQueryId = graph.nextLiveQueryId.take();

        this.graph.liveQueries.set(this.liveQueryId, this);

        this.addFixedListeners();
    }

    addFixedListeners() {
        const cxt = new QueryContext(this.graph);

        for (const { tuple } of this.query.terms.values()) {
            for (const [table, partitionedTuple] of findPartitionsByTable(cxt, tuple)) {
                /*
                const listenerRequestTuple = objectToTuple({
                    id: this.liveQueryId,
                    tuple: partitionedTuple
                });
                */

                table.listeners.set(this.liveQueryId, { type: 'queryFixed' });

                // future - table specific listener logic
                // const out = new Pipe();
                // table.callVerb(cxt, 'add-listener', listenerRequestTuple, out);

                // get an ID corresponding to this connection and store it, we'll need
                // it if this live query is ever closed down.
            }
        }
    }

    run(out: Stream) {
        if (this.isClosed)
            throw new Error("can't run - query has been closed");

        if (this.isRunning)
            throw new Error("can't run - query is already running");

        const cxt = new QueryContext(this.graph);
        cxt.watchingQueries.set(this.liveQueryId, this);

        const wrappedOutput = {
            next(t: Tuple) { out.next(t) },
            done: () => {
                this.finishRun();
                out.done();
            }
        }

        this.isRunning = true;
        runQueryV2(cxt, this.query, wrappedOutput);
    }

    finishRun() {

        this.updateDynamicListensWithNew();
        this.newDynamicListens.clear();
        this.isRunning = false;
    }

    addDynamicListen(mountId: MountId) {
        const table = this.graph.tablesById.get(mountId);

        if (!table)
            throw new Error("invalid mount ID: " + mountId)

        if (!table.listeners.has(this.liveQueryId))
            table.listeners.set(this.liveQueryId, { type: 'dynamic' })

        this.dynamicListens.set(mountId, true);
    }

    removeDynamicListen(mountId: MountId) {
        const table = this.graph.tablesById.get(mountId);

        if (!table)
            throw new Error("invalid mount ID: " + mountId)

        this.dynamicListens.delete(mountId);

        const existing = table.listeners.get(this.liveQueryId);
        if (existing && existing.type !== 'dynamic')
            return;

        table.listeners.delete(this.liveQueryId);
    }

    updateDynamicListensWithNew() {
        // Check for new dynamic listens.
        for (const newlySeenMount of this.newDynamicListens.keys()) {
            if (!this.dynamicListens.has(newlySeenMount)) {
                this.addDynamicListen(newlySeenMount);
            }
        }

        // Check for removed dynamic listens
        for (const existingListenMount of this.dynamicListens.keys()) {
            if (!this.newDynamicListens.has(existingListenMount)) {
                this.removeDynamicListen(existingListenMount);
            }
        }
    }

    runSync(): Relation {
        const [receiver, get] = receiveToRelationSync();
        this.run(receiver);
        return get();
    }

    runAsync(): Promise<Relation> {
        const [receiver, promise] = receiveToRelationAsync();
        this.run(receiver);
        return promise;
    }

    onChange(callback) {
        this.events.on('change', callback);
    }

    onUpdate(callback) {
        this.run(receiveToRelationCallback(callback));

        this.onChange(() => {
            this.run(receiveToRelationCallback(callback));
        });
    }

    close() {
        const cxt = new QueryContext(this.graph);

        this.isClosed = true;
        this.graph.liveQueries.delete(this.liveQueryId);

        for (const { tuple } of this.query.terms.values()) {
            for (const [table, partitionedTuple] of findPartitionsByTable(cxt, tuple)) {
                table.listeners.delete(this.liveQueryId);
            }
        }
    }

    usedDynamicQueryDuringEval(cxt: QueryContext, query: Query) {
        for (const { tuple } of query.terms.values()) {
            for (const [table, partitionedTuple] of findPartitionsByTable(cxt, tuple)) {
                this.newDynamicListens.set(table.mountId, true);
            }
        }
    }
}
