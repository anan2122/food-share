import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (err: AppError, req: Request, res: Response, next: NextFunction) => void;
export declare class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(statusCode: number, message: string);
}
//# sourceMappingURL=errorHandler.d.ts.map