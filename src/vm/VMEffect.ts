

export default interface VMEffect {
    type: 'set-env' | 'emit-result'
    execId: number
    name?: string
    value?: string
}
