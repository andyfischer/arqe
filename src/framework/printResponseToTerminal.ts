
import { Query } from '../query'
import { print } from '../utils'

export default function printResponseToTerminal(query: Query, data: any) {
    if (data.body) {
        if (typeof data.body === 'string') {
            print(data.body);
        } else {
            print(JSON.stringify(data.body));
        }
    } else {
        print(JSON.stringify(data));
    }
}
