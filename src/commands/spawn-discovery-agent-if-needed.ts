
import { declareCommand, Query } from '..'
import { spawn } from '../stdlib'

declareCommand({
    name: 'spawn-discovery-agent-if-needed',
    run: (query) => {
        spawn(query.get('discovery-service/launch-cmd'));
        query.respond(null);
    }
})
