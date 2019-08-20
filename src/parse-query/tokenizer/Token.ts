
import { TokenDef } from './tokens'

export default interface Token {
    match: TokenDef
    length: number
    startPos: number
    endPos: number
    lineStart: number
    columnStart: number
}
