export default function collectRespond(onDone: any): (message: any) => void;
interface GraphLike {
    run: (q: string, respond: (response: string) => void) => void;
}
export declare function runSync(graph: GraphLike, q: string): any;
export {};
