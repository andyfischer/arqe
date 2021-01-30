
/*
import Tuple from "./Tuple";
import { toTuple, toQuery, QueryLike, TupleLike } from './coerce'
import TableMount, { TupleStreamCallback } from "./TableMount";
import Pipe, { newNullPipe } from './Pipe'
import OutputStream from "./OutputStream";
import { runQuery } from './runQuery'

export default function mountQueryHandler(schema: Tuple, queryLike: QueryLike) {
    const query = toQuery(queryLike);

    const mount = new TableMount(null, schema);

    mount.addHandler('get', '_query_scope(scope)', (input: Tuple, out: OutputStream) => {

        // Extract the scope
        const parentScope = input.getValue('_query_scope');
        const scope = parentScope.newChild();
        input = input.drop('_query_scope');

        console.log('processing query with: ', query.stringify());

        runQuery(scope, query, newNullPipe(), processedOutPipe);

        processedOutPipe
        .then(processedQuery => {
            console.log('running processed query: ', processedQuery.stringify())
            runQuery(scope, processedQuery, newNullPipe(), out);
        });
    });

    return mount;
}
*/
