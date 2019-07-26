
import { Query } from '../query'
import { print } from '../utils'
import formatForTerminal from '../respond/formatForTerminal' 

export default function printResponseToTerminal(query: Query, data: any) {
    print(formatForTerminal(data));
}
