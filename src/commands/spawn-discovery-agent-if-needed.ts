
import { implement, Query } from '..'
import { spawn } from '../stdlib'
import { Snapshot } from '../framework'

export default function(snapshot: Snapshot) {
    implement('spawn-discovery-agent-if-needed', (query) => {
        spawn(query.get('discovery-service/launch-cmd'));
        query.respond(null);
    });
}
