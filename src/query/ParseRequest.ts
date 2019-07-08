
import ParseContext from './ParseContext'

export default interface ParseRequest {
    query: string
    session?: string
    context?: ParseContext
}
