import Boom from 'boom';
import { DecoratedReply, DecoratedRequest, ExtendedError } from '../environment';
export declare function serializeErrorDescription(error: ExtendedError): string;
export declare function serializeErrorStack(error: Error): Array<string>;
export declare function handleNotFoundError(_r: DecoratedRequest, reply: DecoratedReply): void;
export declare function handleInternalError(error: Error | ExtendedError | Boom, _r: DecoratedRequest, reply: DecoratedReply): void;
