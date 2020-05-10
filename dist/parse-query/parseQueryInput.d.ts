import { QuerySyntax } from '.';
interface Options {
    filename?: string;
}
export default function parseQueryInput(str: string, opts?: Options): QuerySyntax[];
export {};
