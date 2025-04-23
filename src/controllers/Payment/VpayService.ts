import axios from "axios";
import { VpayVerifyPaymentResInterface } from "../../types/Payment";
require("dotenv").config();

// Add proper validation and logging for environment variables
const VPAY_BASEURL = process.env.VPAY_BASEURL;
const VPAY_EMAIL = process.env.VPAY_EMAIL;
const VPAY_PASSWORD = process.env.VPAY_PASSWORD;
const VPAY_PUBLIC_KEY = process.env.VPAY_PUBLIC_KEY;

// Log environment variable status for debugging
console.log("Payment Environment Variables Status:");
console.log(`VPAY_BASEURL: ${VPAY_BASEURL ? "Set" : "MISSING"}`);
console.log(`VPAY_EMAIL: ${VPAY_EMAIL ? "Set" : "MISSING"}`);
console.log(`VPAY_PASSWORD: ${VPAY_PASSWORD ? "Set" : "MISSING"}`);
console.log(`VPAY_PUBLIC_KEY: ${VPAY_PUBLIC_KEY ? "Set" : "MISSING"}`);

const GenerateToken = async () => {
  try {
    // Validate required environment variables
    if (!VPAY_BASEURL) {
      throw new Error("VPAY_BASEURL is not defined in environment variables");
    }
    if (!VPAY_EMAIL) {
      throw new Error("VPAY_EMAIL is not defined in environment variables");
    }
    if (!VPAY_PASSWORD) {
      throw new Error("VPAY_PASSWORD is not defined in environment variables");
    }
    if (!VPAY_PUBLIC_KEY) {
      throw new Error("VPAY_PUBLIC_KEY is not defined in environment variables");
    }

    console.log(`Attempting to generate token with URL: ${VPAY_BASEURL}/api/service/v1/query/merchant/login`);
    
    const response = await axios.post(
      `${VPAY_BASEURL}/api/service/v1/query/merchant/login`,
      {
        username: VPAY_EMAIL,
        password: VPAY_PASSWORD,
      },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          publicKey: VPAY_PUBLIC_KEY,
        },
      }
    );
    
    console.log("Token generated successfully");
    return response.data;
  } catch (error: any) {
    console.error("Token generation error:", error.message);
    
    // More detailed error logging
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      console.error("No response received, request details:", error.request._currentUrl);
    }
    
    throw new Error(`Failed to generate VPay token: ${error.message}`);
  }
};

export const VerifyPayment = async (transactionRef: string): Promise<VpayVerifyPaymentResInterface | void> => {
  try {
    console.log(`Verifying payment for transaction: ${transactionRef}`);
    
    // Generate token with proper error handling
    let tokenData;
    try {
      tokenData = await GenerateToken();
      console.log("Token obtained:", tokenData ? "Success" : "Failed");
    } catch (tokenError: any) {
      console.error("Token generation failed:", tokenError.message);
      throw tokenError;
    }
    
    if (!tokenData || !tokenData.token) {
      throw new Error("Invalid token response received from VPay");
    }
    
    console.log(`Making verification request to ${VPAY_BASEURL}/api/v1/webintegration/query-transaction`);
    
    const response = await axios.post(
      `${VPAY_BASEURL}/api/v1/webintegration/query-transaction`,
      {
        transactionRef
      },
      {
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "publicKey": VPAY_PUBLIC_KEY,
          "b-access-token": tokenData.token
        },
      }
    );
    
    console.log("Verification response received:", response.status);
    return response.data;
  } catch (error: any) {
    console.error("Payment verification error:", error.message);
    
    // More detailed error logging
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      console.error("No response received, request details:", error.request._currentUrl);
    }
    
    throw error;
  }
};
