
import { Query } from '..'
import { print } from '../utils'
import { Snapshot } from '.'
import { Reducer } from '../framework'

const logChanges = !!process.env.log_document_changes;

export default function applyQueryToDocument(snapshot: Snapshot, reducer: Reducer, query: Query) {

    let previousValue;

    const log = logChanges && !reducer.spamsChangeLog;

    if (log)
        previousValue = JSON.stringify(reducer.value);
    
    reducer.value = reducer.reducer(query, reducer.value);

    // Catch any async errors (if needed)
    Promise.resolve(reducer.value).catch(err => {
        print('error: ' + err);

        if (err.stack && snapshot.getValueOpt('enable-stack-traces', false))
            console.log(err.stack);
    });

    if (log) {
        const newValue = JSON.stringify(reducer.value);
        if (previousValue != newValue) {
            print(`document '${reducer.name}' has changed value:`)
            print(`  was: ${previousValue}`)
            print(`  now: ${newValue}`)
        }
    }
}
