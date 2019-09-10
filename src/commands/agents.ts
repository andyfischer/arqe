
import { implement } from '..'
import { getAgents, getServices } from '../agents/clientApi'
import { Snapshot } from '../framework'

export default function(snapshot: Snapshot) {
    snapshot.implement('list-agents', async (query) => {
        const data = await getAgents(query.snapshot);

        query.respond({
            type: 'agent[]',
            terminalFormat: 'table',
            items: data
        });
    });

    snapshot.implement('list-services', async (query) => {
        const data = await getServices(query.snapshot);

        query.respond({
            body: data
        });
    });
}
