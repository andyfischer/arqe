
import { Query } from '..'

export default function(query: Query) {
    const str = query.syntax.originalStr;
    query.snapshot.globalValues.lastQueryStr = query.snapshot.globalValues.thisQueryStr;
    query.snapshot.globalValues.thisQueryStr = str;
}
