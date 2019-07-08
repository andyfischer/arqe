import CommandPatternMatcher from "./CommandPatternMatcher";
import NativeHandler from "./NativeHandler";

export default class TableDef {
    handlers = new CommandPatternMatcher<NativeHandler>()
}
