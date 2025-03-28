import axios from "axios";
import { VpayVerifyPaymentResInterface } from "../../types/Payment";

require("dotenv").config();

const GenerateToken = async () => {
  return axios
    .post(
      `${process.env.VPAY_BASEURL}/api/service/v1/query/merchant/login`,
      {
        username: process.env.VPAY_EMAIL,
        password: process.env.VPAY_PASSWORD,
      },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          publicKey: process.env.VPAY_PUBLIC_KEY,
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

export const VerifyPayment = async (transactionRef: string): Promise<VpayVerifyPaymentResInterface | void> => {
  const token = await GenerateToken();
console.log("totke", token);

  return axios
    .post(
      `${process.env.VPAY_BASEURL}/api/v1/webintegration/query-transaction`,
      {
        transactionRef
      },
      {
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "publicKey": process.env.VPAY_PUBLIC_KEY,
          "b-access-token": token.token
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
