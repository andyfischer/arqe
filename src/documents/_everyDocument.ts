
import { DocumentMount } from '../snapshot'

const everyDocument: (() => DocumentMount)[] = [
    require('./autocompleteInfo').default,
    require('./bootstrapScripts').default,
    require('./commandDatabase').default,
    require('./lastIncompleteClause').default,
    require('./relations').default,
    require('./invalidQueryCheck').default
]

export default everyDocument;
