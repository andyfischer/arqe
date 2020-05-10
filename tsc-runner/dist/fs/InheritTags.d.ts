import UpdateContext from './UpdateContext';
export default class InheritTags {
    anyFound: boolean;
    byTypeName: {
        [typeName: string]: true;
    };
}
export declare function updateInheritTags(cxt: UpdateContext): InheritTags;
