
import { ParseContext, Query } from '.'
import { print } from '../utils'
import parseSyntax from './parseSyntax'
import parseQueryStructure from './parseQueryStructure'

const verbose = !!process.env.verbose_query_parse;

export default function parse(str: string, context: ParseContext): Query {
    if (verbose)
        print('parsing query: ' + str);

    const parsedSyntax = parseSyntax(str);
    const parsed = parseQueryStructure(context, parsedSyntax);

    if (verbose)
        print('  parsed as: ' + JSON.stringify(parsed));

    return parsed;
}
