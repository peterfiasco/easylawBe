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
const GenerateToken = () => __awaiter(void 0, void 0, void 0, function* () {
    return axios_1.default
        .post(`${process.env.VPAY_BASEURL}/api/service/v1/query/merchant/login`, {
        username: process.env.VPAY_EMAIL,
        password: process.env.VPAY_PASSWORD,
    }, {
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            publicKey: process.env.VPAY_PUBLIC_KEY,
        },
    })
        .then((response) => {
        return response.data; // Return response data directly
    })
        .catch((error) => {
        console.log(error);
        return Promise.reject(error.response ? error.response.data : error.message); // Return error message
    });
});
const VerifyPayment = (transactionRef) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield GenerateToken();
    console.log("totke", token);
    return axios_1.default
        .post(`${process.env.VPAY_BASEURL}/api/v1/webintegration/query-transaction`, {
        transactionRef
    }, {
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "publicKey": process.env.VPAY_PUBLIC_KEY,
            "b-access-token": token.token
        },
    })
        .then((response) => {
        return response.data; // Return response data directly
    })
        .catch((error) => {
        console.log(error);
        return Promise.reject(error.response ? error.response.data : error.message); // Return error message
    });
});
exports.VerifyPayment = VerifyPayment;
