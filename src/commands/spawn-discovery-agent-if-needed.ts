
import { implement, Query } from '..'
import { spawn } from '../stdlib'

implement('spawn-discovery-agent-if-needed', (query) => {
    spawn(query.get('discovery-service/launch-cmd'));
    query.respond(null);
});
