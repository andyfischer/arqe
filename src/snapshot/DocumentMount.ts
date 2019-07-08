
import { Query, QueryContext } from '../query'
import { print } from '../utils'
import { Snapshot } from '.'

const logChanges = !!process.env.log_document_changes;

export default interface DocumentMount<T = any> {
    name: string
    value: T
    reducer: (query: Query, currentValue: T, cxt?: QueryContext) => T
    spamsChangeLog?: boolean
}

export function applyQueryToDocument(context: QueryContext, mount: DocumentMount, query: Query) {

    let previousValue;

    const log = logChanges && !mount.spamsChangeLog;

    if (log)
        previousValue = JSON.stringify(mount.value);
    
    mount.value = mount.reducer(query, mount.value, context);

    if (log) {
        const newValue = JSON.stringify(mount.value);
        if (previousValue != newValue) {
            print(`document '${mount.name}' has changed value:`)
            print(`  was: ${previousValue}`)
            print(`  now: ${newValue}`)
        }
    }
}
