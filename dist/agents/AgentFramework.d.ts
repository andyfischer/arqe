import ExpressPromisedApp from '../express-promised-app';
import { Snapshot } from '../framework';
interface SetupArgs {
    name: string;
    snapshot: Snapshot;
}
export default class AgentFramework {
    serviceId: string;
    setupArgs: SetupArgs;
    webApp: ExpressPromisedApp;
    httpServer: any;
    snapshot: Snapshot;
    constructor(args: SetupArgs);
    private setupEndpoints;
    implementCommand(): void;
    start(): Promise<void>;
    stop(): Promise<void>;
}
export {};
