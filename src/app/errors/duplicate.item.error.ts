import httpStatusCodes from 'http-status-codes'
import { BaseError } from './base.error';

export class DuplicateItemError extends BaseError {
    static staticMessage = 'Duplicate item';
    constructor(error?: string) {
      const message = error ?  error : DuplicateItemError.staticMessage;
      super(message);
      this.name = 'DuplicateItemError';
      this.statusCode = httpStatusCodes.BAD_REQUEST;
      this.message = message;
      console.log(this.message);
    }
  }