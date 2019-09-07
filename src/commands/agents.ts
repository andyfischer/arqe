
import { implement } from '..'
import { getAgents, getServices } from '../agents/clientApi'

implement('list-agents', async (query) => {
    const data = await getAgents(query.snapshot);

    query.respond({
        type: 'agent[]',
        terminalFormat: 'table',
        items: data
    });
});

implement('list-services', async (query) => {
    const data = await getServices(query.snapshot);

    query.respond({
        body: data
    });
});
