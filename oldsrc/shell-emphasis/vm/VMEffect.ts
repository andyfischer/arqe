
export default interface VMEffect {
    type: 'define' | 'value' | 'relation'
    fromTaskId: string
    name?: string
    value?: string
}
