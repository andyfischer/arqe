

export default interface VMEffect {
    type: 'set-env' | 'save-result'
    taskId: number
    name?: string
    value?: string
}
