
export { default as RichValue } from './RichValue'
export { assertValue } from './validation'

export function error(message: string) {
    return { error: message }
}
