declare type PatchType = 'override';
export default class ScopeValue {
    value: any;
    empty: boolean;
    patch?: PatchType;
}
export {};
