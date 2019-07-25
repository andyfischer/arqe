
import { Snapshot } from '../framework'
import Bent from 'bent'
import ServiceInfo from '../types/ServiceInfo'

export async function getAgents(snapshot: Snapshot) {
    const discoveryServiceUrl = snapshot.getValue('discovery-service-url');

    const get = Bent(discoveryServiceUrl, 'GET', 'json', 200);

    const resp: { services: ServiceInfo[] } = await get('find?tag=agent');

    return resp.services || [];
}

export async function getServices(snapshot: Snapshot) {
    const discoveryServiceUrl = snapshot.getValue('discovery-service-url');

    const get = Bent(discoveryServiceUrl, 'GET', 'json', 200);

    const resp: { services: ServiceInfo[] } = await get('find');

    return resp.services || [];
}
