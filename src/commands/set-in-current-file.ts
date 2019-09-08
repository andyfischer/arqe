
import { implement } from '..'

implement('set-in-current-file', async (query) => {
    const key = query.args[1];
    const value = query.args[2];

    query.snapshot.fileScopedValues[key] = value;
    return
});
