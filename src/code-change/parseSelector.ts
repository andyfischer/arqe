
import { parseQueryInput } from '../parse-query'



export default function parseSelector(selector: string) {

    const querySyntax = parseQueryInput(selector);
}

// examples:
//       find-call implementAll, enter-function, after-contents
//       insert after-imports
//       replace call func=implement argument 0
