
import { Query } from '..'
import { declareReducer } from '../framework'
import { freeze } from '../utils'

declareReducer(() => {
    return {
        name: 'lastQueryStr',
        value: null,
        reducer(query: Query, value) {
            const str = query.syntax.originalStr;
            query.snapshot.globalValues.lastQueryStr = query.snapshot.globalValues.thisQueryStr;
            query.snapshot.globalValues.thisQueryStr = str;
            return null;
        }
    }
});
