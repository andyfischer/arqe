import { Snapshot } from '../framework';
import ServiceInfo from '../types/ServiceInfo';
export declare function getAgents(snapshot: Snapshot): Promise<ServiceInfo[]>;
export declare function getServices(snapshot: Snapshot): Promise<ServiceInfo[]>;
