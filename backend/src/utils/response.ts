import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  meta?: { total: number; page: number; limit: number },
  status = 200
) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta,
  };
  return res.status(status).json(response);
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
