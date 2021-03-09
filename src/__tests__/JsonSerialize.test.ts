
import { Query, toQuery, QueryLike, queryToJson, jsonToQuery,
    toTuple, TupleLike, tupleToJson, jsonToTuple,
    tagToJson, jsonToTag
} from '..'

import { queryBidirectionalJsonTest, tupleBidirectionalJsonTest } from '../test/SelfTest'

const tupleStringSamples = [
    "a b",
    "a[1]",
    "a(get a)",
    "b/$b",
    "*",
    "**",
    "a b *",
    "a b **"
];

const queryStringSamples = [
    "get a b",
    "get a[1]",
    "get a($a) b",
    "get a b | join b c",
];

it("tuple to JSON bidirectional test", () => {
    for (const sample of tupleStringSamples)
        tupleBidirectionalJsonTest(sample);
});

it("query to JSON bidirectional test", () => {
    for (const sample of queryStringSamples)
        queryBidirectionalJsonTest(sample);
});

