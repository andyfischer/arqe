
import { Query } from '..'
import { print } from '../utils'
import formatReadableText from '../rich-values/readable-text' 

export default function printResponseToTerminal(query: Query, data: any) {
    print(formatReadableText(query.snapshot, data));
}
