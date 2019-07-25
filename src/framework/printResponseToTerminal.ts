
import { Query } from '../query'
import { print } from '../utils'
import formatForTerminal from '../terminal/formatForTerminal' 

export default function printResponseToTerminal(query: Query, data: any) {
    print(formatForTerminal(data));
}
