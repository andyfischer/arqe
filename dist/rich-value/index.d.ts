export { default as RichValue } from './RichValue';
export { assertValue } from './validation';
import RichValue from './RichValue';
export { default as Value } from './RichValue';
export declare function error(message: string): {
    error: string;
};
export declare function performedAction(description: string): {
    performed: string;
};
export declare function done(): {
    done: boolean;
};
export declare function isList(val: RichValue): boolean;
export declare function setInEnvironment(name: string, value: string): {
    setInEnvironment: string;
    value: string;
};
