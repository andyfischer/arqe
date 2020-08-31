
import Graph from '../Graph'
import CommandParams from '../CommandParams'
import Tuple, { objectToTuple } from '../Tuple'
import QueryContext from '../QueryContext';

function createWatchCommand(graph: Graph, pattern: Tuple) {
    const res = graph.runSync(`set watch((unique)) pattern(${pattern.stringify()})`)[0];
}

export default function watchCommand(cxt: QueryContext, params: CommandParams) {
    const { output } = params;
    const pattern = params.command.pattern;

    output.next(objectToTuple({ 'command-meta': true, 'watch': true }));

    createWatchCommand(cxt.graph, pattern);

    output.done();
}

/*
How to implement watches in the system?

Any query can be watch-enabled

In some (most?) cases we will need to re-run the whole query on changes

Watching is a meta operation on top of the query. Each point of data access needs to
be intercepted.

Need to be able to scan the entire piped query and create table watches on data fetches.

Watches can later be stopped. Need to cleanup data when this happens.

1) Graph.watchQuery
  - Parse query
  - Look for accesses
  - For each table access
    - Create a table watch
  - When those trigger, re-run entire query and send updated results
  - Optimization future:
    - Support 'relation diffs'
    - Auto-cache intermediate accesses, when safe

*/