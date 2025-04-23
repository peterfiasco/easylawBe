"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPayment = void 0;
const axios_1 = __importDefault(require("axios"));
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
const GenerateToken = () => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield axios_1.default.post(`${VPAY_BASEURL}/api/service/v1/query/merchant/login`, {
            username: VPAY_EMAIL,
            password: VPAY_PASSWORD,
        }, {
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                publicKey: VPAY_PUBLIC_KEY,
            },
        });
        console.log("Token generated successfully");
        return response.data;
    }
    catch (error) {
        console.error("Token generation error:", error.message);
        // More detailed error logging
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
        else if (error.request) {
            console.error("No response received, request details:", error.request._currentUrl);
        }
        throw new Error(`Failed to generate VPay token: ${error.message}`);
    }
});
const VerifyPayment = (transactionRef) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Verifying payment for transaction: ${transactionRef}`);
        // Generate token with proper error handling
        let tokenData;
        try {
            tokenData = yield GenerateToken();
            console.log("Token obtained:", tokenData ? "Success" : "Failed");
        }
        catch (tokenError) {
            console.error("Token generation failed:", tokenError.message);
            throw tokenError;
        }
        if (!tokenData || !tokenData.token) {
            throw new Error("Invalid token response received from VPay");
        }
        console.log(`Making verification request to ${VPAY_BASEURL}/api/v1/webintegration/query-transaction`);
        const response = yield axios_1.default.post(`${VPAY_BASEURL}/api/v1/webintegration/query-transaction`, {
            transactionRef
        }, {
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "publicKey": VPAY_PUBLIC_KEY,
                "b-access-token": tokenData.token
            },
        });
        console.log("Verification response received:", response.status);
        return response.data;
    }
    catch (error) {
        console.error("Payment verification error:", error.message);
        // More detailed error logging
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
        else if (error.request) {
            console.error("No response received, request details:", error.request._currentUrl);
        }
        throw error;
    }
});
exports.VerifyPayment = VerifyPayment;
