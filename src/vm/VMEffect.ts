

export default interface VMEffect {
    type: 'set-env' | 'emit-result'
    taskId: number
    name?: string
    value?: string
}
