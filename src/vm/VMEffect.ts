
export default interface VMEffect {
    type: 'define' | 'value'
    fromTaskId: string
    name?: string
    value?: string
}
