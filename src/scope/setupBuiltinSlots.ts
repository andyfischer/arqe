
import Scope from './Scope'

export default function setupBuiltinSlots(scope: Scope) {
    scope.createSlot("commandDatabase");
    scope.createSlot("relations");
    scope.createSlot("relationDatabase");
    scope.createSlot("lastIncompleteClause");
    scope.createSlot("thisQueryStr");
    scope.createSlot("lastQueryStr");
    scope.createSlot("autocompleteInfo");
    scope.createSlot("functionDatabase");
}
