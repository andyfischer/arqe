
import { Query } from '../query'
import { declareReducer } from '../framework'
import { getAgents, getServices } from '../agents/clientApi'

declareReducer(() => {
    return {
        name: 'agents',
        value: { },
        async reducer(query: Query, value) {
            if (query.command === 'list-agents') {

                const data = await getAgents(query.snapshot);

                query.respond({
                    body: data
                })
            }

            if (query.command === 'list-services') {

                const data = await getServices(query.snapshot);

                query.respond({
                    body: data
                })
            }
        }
    }
});
