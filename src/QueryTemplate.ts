
import Tuple from './Tuple'
import { toQuery, QueryLike } from './coerce'
import Query from './Query'
import { recursivelyReplaceFromTerms } from './verbs/rewrite'

export default class QueryTemplate {
    query: Query

    constructor(queryLike: QueryLike) {
        this.query = toQuery(queryLike);
    }

    with(valuesFrom: Tuple) {
        return this.query.remapTuples((tuple:Tuple) => {
            return recursivelyReplaceFromTerms(tuple, valuesFrom);
        })
    }
}
