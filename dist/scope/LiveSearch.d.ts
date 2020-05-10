import ParsedTag from './ParsedTag';
import Graph from './Graph';
import FindExtResult from './FindExtResult';
interface FoundMatch {
    remainingTag: string;
}
export default class LiveSearch {
    latestMatches: {
        [tag: string]: FoundMatch;
    };
    exactTags: string[];
    tagPrefixes: string[];
    tagCount: number;
    matches(parsedTag: ParsedTag): boolean;
    toFoundMatch(parsedTag: ParsedTag): FoundMatch;
    maybeInclude(parsedTag: ParsedTag): void;
    maybeDelete(tag: string): void;
    latest(graph: Graph): any[];
    latestExt(graph: Graph): FindExtResult[];
}
export {};
