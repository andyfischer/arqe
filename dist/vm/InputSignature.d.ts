export default interface InputSignature {
    id?: number;
    fromName?: string;
    fromPosition?: number;
    fromMeta?: 'scope';
    restStartingFrom?: number;
    restKeyValues?: boolean;
    isRequired?: boolean;
    defaultValue?: any;
}
