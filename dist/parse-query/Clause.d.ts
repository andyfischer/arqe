export default interface Clause {
    key?: string;
    assignVal?: string;
    isRemainder?: boolean;
    isRelation?: boolean;
    isCommand?: boolean;
    isOmitted?: boolean;
    isComment?: boolean;
}
