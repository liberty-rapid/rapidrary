import { ErrorConstant } from './error-constants';

export class ServiceError extends Error {
    status: number;
    errorCode: string;

    constructor(errorConstant: ErrorConstant) {
        super(errorConstant.message);
        this.status = errorConstant.status;
        this.errorCode = errorConstant.code;
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}
