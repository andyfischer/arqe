import ExpressPromisedApp from '.';
interface Options {
    setupEndpoints: (app: ExpressPromisedApp) => void;
    printAccessLog?: boolean;
}
export default function createExpressApp(opts: Options): ExpressPromisedApp;
export {};
