
import { Query } from '.'

type ImplementationFunc = (query: Query) => void

declare const fslib: {
    implement: (name: string, func: ImplementationFunc) => void
}
