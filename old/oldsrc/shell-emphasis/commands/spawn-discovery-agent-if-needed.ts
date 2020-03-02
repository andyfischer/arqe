
import { Query } from '..'
import { spawn } from '../stdlib'
import { Snapshot } from '../framework'

export default function(snapshot: Snapshot) {
    snapshot.implement('spawn-discovery-agent-if-needed', (query) => {
        spawn(query.get('discovery-service/launch-cmd'));
        query.respond(null);
    });
}
