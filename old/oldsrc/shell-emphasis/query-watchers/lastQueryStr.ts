
import { Query } from '..'

export default function(query: Query) {
    const str = query.syntax.originalStr;
    query.snapshot.globalScope.set('lastQueryStr', query.snapshot.globalScope.getOptional('thisQueryStr', null));
    query.snapshot.globalScope.set('thisQueryStr', str);
}
