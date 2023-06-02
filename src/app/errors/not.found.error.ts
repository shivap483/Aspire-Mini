import httpStatusCodes from 'http-status-codes'
import { BaseError } from './base.error';

export class NotFoundError extends BaseError {
  static staticMessage = 'User not found for given data';
  constructor(error?: string) {
    const message = error ? error : NotFoundError.staticMessage;
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = httpStatusCodes.NOT_FOUND;
    this.message = message;
    console.log(this.message);
  }
}