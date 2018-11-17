import { BoomError, ExtendedError } from '@cowtech/favo';
import Boom from 'boom';
import { DecoratedReply, DecoratedRequest } from './index';
export declare function clientError<T = any>(reply: DecoratedReply, boom: BoomError<T>, message?: string, data?: T): Boom<T>;
export declare function handleNotFoundError(_r: DecoratedRequest, reply: DecoratedReply): void;
export declare function handleInternalError(error: Error | ExtendedError | Boom, req: DecoratedRequest, reply: DecoratedReply): void;
