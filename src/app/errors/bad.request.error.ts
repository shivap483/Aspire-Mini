import httpStatusCodes from 'http-status-codes'
import { BaseError } from './base.error';

export class BadRequestError extends BaseError {
    static staticMessage = 'Bad Request';
    constructor(error?: string) {
      const message = error ?  error : BadRequestError.staticMessage;
      super(message);
      this.name = 'BadRequestError';
      this.statusCode = httpStatusCodes.BAD_REQUEST;
      this.message = message;
      console.log(this.message);
    }
  }