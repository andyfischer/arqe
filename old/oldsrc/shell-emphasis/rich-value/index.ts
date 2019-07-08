

export { default as RichValue } from './RichValue'
export { assertValue } from './validation'

import RichValue from './RichValue'

export { default as Value } from './RichValue'

export function error(message: string) {
    return { error: message }
}

export function performedAction(description: string) {
    return { performed: description }
}

export function done() {
    return { done: true }
}

export function isList(val: RichValue) {
    return !!val.items;
}

export function setInEnvironment(name: string, value: string) {
    return {
        setInEnvironment: name,
        value
    }
}
