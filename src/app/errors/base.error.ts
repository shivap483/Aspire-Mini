export class BaseError extends Error {
    statusCode: number;
    data: string;
    messageKey: string;
    constructor(error: any){
        super(error)
    };
}