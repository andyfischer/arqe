
import { getDateStamp } from '.'
import { implement } from '..'

implement('get-date-stamp', (query) => {
    query.respond(getDateStamp());
});
