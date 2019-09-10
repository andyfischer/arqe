
import { Snapshot } from '../framework'
import { getDateStamp } from '../timedate'

export default function(snapshot: Snapshot) {
    snapshot.implement('get-date-stamp', (query) => {
        query.respond(getDateStamp());
    });
}

