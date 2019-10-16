
export default interface InputSignature {
    id?: number
    fromName?: string
    fromPosition?: number
    fromMeta?: 'scope'
    restStartingFrom?: number
    isRequired?: boolean
    defaultValue?: any
}

