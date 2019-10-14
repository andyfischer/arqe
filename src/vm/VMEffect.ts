
export default interface VMEffect {
    type: 'set-env' | 'save-result' | 'fill-pending-input'
    fromTaskId: string
    name?: string
    value?: string
}
