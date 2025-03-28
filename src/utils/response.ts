import { Response } from "express";

export const successResponse = (
  res: Response,
  message: string,
  data = {},
  statusCode = 200
): any => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
export const errorResponse = (
  res: Response,
  message: string,
  data = {},
  statusCode = 500
): any => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
};
