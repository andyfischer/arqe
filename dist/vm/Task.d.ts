import { Scope } from '../Scope';
export default interface Task {
    id: string;
    scope: Scope;
    done?: boolean;
    error?: any;
    result?: any;
}
