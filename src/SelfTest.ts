
import { toQuery, QueryLike, toTuple, TupleLike } from './coerce'
import { jsonToQuery, queryToJson } from './Query'
import { jsonToTuple, tupleToJson } from './Tuple'

export function queryBidirectionalJsonTest(queryLike: QueryLike) {
    const query = toQuery(queryLike);
    const reparsed = jsonToQuery(queryToJson(query));

    if (query.stringify() !== reparsed.stringify()) {
        // console.log('as json: ', JSON.stringify(queryToJson(query), null, 2));
        throw new Error(`queryBidirectionalJsonTest failed: ${query.stringify()} != ${reparsed.stringify()}`);
    }
}

export function tupleBidirectionalJsonTest(tupleLike: TupleLike) {
    const tuple = toTuple(tupleLike);
    const reparsed = jsonToTuple(tupleToJson(tuple));

    if (tuple.stringify() !== reparsed.stringify()) {
        console.log('original as json: ', JSON.stringify(tupleToJson(tuple), null, 2));
        throw new Error(`tupleBidirectionalJsonTest failed: ${tuple.stringify()} != ${reparsed.stringify()}`);
    }
}

