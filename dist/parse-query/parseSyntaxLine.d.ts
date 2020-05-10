import QuerySyntax from './QuerySyntax';
import { TokenIterator } from '../lexer';
export declare function parseSyntaxLineFromTokens(it: TokenIterator): QuerySyntax;
export default function parseSyntaxLine(str: string): QuerySyntax;
