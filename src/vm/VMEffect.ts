

export default interface VMEffect {
    type: 'set-env' | 'emit-result'

    name?: string
    value?: string
}
