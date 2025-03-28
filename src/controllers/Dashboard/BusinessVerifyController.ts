import { Response } from "express";
import axios from "axios";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import { BusinessInterface } from "../../types/Dashboard";
import { BusinessSchema } from "./Validation/Validator";

require("dotenv").config();

const CheckCACName = async (name: string, business: string) => {
  return axios
    .post(
      `https://vasapp.cac.gov.ng/api/vas/engine/pre/bn-compliance`,
      {
        proposedName: name,
        lineOfBusiness: business,
      },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X_API_KEY": process.env.CAC_API_KEY,
        },
      }
    )
    .then((response: any) => {
      return response.data; // Return response data directly
    })
    .catch((error: any) => {
      console.log(error);
      return Promise.reject(
        error.response ? error.response.data : error.message
      ); // Return error message
    });
};

export const BusinessVerify = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, business }: BusinessInterface = req.body;
    const { error } = BusinessSchema.validate(req.body);
    if (error)
      return errorResponse(
        res,
        `Validation error: ${error.details[0].message}`,
        { error: error.details[0].message },
        400
      );

    const response = await CheckCACName(name, business);

    return successResponse(res, "CAC Check successful", { response }, 200);
  } catch (error: any) {
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
};
