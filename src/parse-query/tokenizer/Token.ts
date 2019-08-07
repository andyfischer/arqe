
import { TokenDef } from './tokens'

export default interface Token {
    match: TokenDef
    startPos: number
    endPos: number
    lineNumber: number
    charNumber: number
}
