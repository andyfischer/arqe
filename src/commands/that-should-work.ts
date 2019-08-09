
import { implement, Query, appendToLog } from '..'

implement('that-should-work', (query: Query) => {
    const str = query.get('lastQueryStr');
    const shouldWork = 'should-work -- ' + str;
    appendToLog('should-work', shouldWork);
    query.respond(`saving: ${shouldWork}`)
});
