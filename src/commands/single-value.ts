import QueryContext from "../QueryContext";
import CommandParams from "../CommandParams";

export default function singleValue(cxt: QueryContext, params: CommandParams) {
    params.output.next(params.command.pattern);
    params.output.done();
}