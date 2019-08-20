
import { tokenizeString } from './tokenizer'
import { QuerySyntax } from '.'
import parseSyntaxLine from './parseSyntaxLine'

export default async function parseSyntaxFile(str: string, next: (syntax: QuerySyntax) => Promise<void>) {


    const tokens = tokenizeString(str);
    const reader = tokens.reader;

}
