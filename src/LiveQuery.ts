
import QueryV2, { TermId, runQueryV2 } from './QueryV2'
import Graph from './Graph'
import TableMount, { MountId } from './TableMount'
import Tuple, { objectToTuple } from './Tuple';
import QueryContext from './QueryContext';
import findPartitionsByTable from './findPartitionsByTable';
import Pipe from './Pipe';
import { EventEmitter } from 'events';
import Stream from './Stream';
import Relation, { receiveToRelationSync, receiveToRelationAsync } from './Relation';

export type LiveQueryId = string;

interface TermWatch {
}

export default class LiveQuery {
    liveQueryId: string
    graph: Graph
    query: QueryV2

    watches = new Map<TermId, TermWatch>()

    _isClosed = false
    events = new EventEmitter()

    constructor(graph: Graph, query: QueryV2) {
        this.graph = graph;
        this.query = query;
        this.liveQueryId = graph.nextLiveQueryId.take();

        this.graph.liveQueries.set(this.liveQueryId, this);

        this._addListeners();
    }

    _addListeners() {
        const mounts = new Map<MountId, TableMount>();

        for (const { verb, tuple } of this.query.terms.values()) {
            addListenerV4(this.graph, this.liveQueryId, tuple);
        }
    }

    run(out: Stream) {
        runQueryV2(this.graph, this.query, out);
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

    close() {
        this._isClosed = true;
        this.graph.liveQueries.delete(this.liveQueryId);
    }

    // add a listener callback that is triggered by Graph
    //
    // Graph contains a list of pending updates when it does an operation.
}

function addListenerV4(graph: Graph, id: string, tuple: Tuple) {
    const cxt = new QueryContext(graph);

    for (const [table, partitionedTuple] of findPartitionsByTable(cxt, tuple)) {
        const listenerRequestTuple = objectToTuple({
            id,
            tuple: partitionedTuple
        });

        table.listeners.set(id, true);

        // future - table specific listener logic
        // const out = new Pipe();
        // table.callVerb(cxt, 'add-listener', listenerRequestTuple, out);

        // get an ID corresponding to this connection and store it, we'll need
        // it if this live query is ever closed down.
    }
}

// any modification event should call pushChangeEvent.
// at the end of a modification command, flush pending change events.

/*
- Listeners:
  - Create unique entry with id
  - Compile to QueryV2
  - Look at every term
  - Find that table
  - Call 'add-listener' on that table
  - What about 'run-query' ?
*/
