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
exports.BusinessVerify = void 0;
const axios_1 = __importDefault(require("axios"));
const response_1 = require("../../utils/response");
const Validator_1 = require("./Validation/Validator");
require("dotenv").config();
const CheckCACName = (name, business) => __awaiter(void 0, void 0, void 0, function* () {
    return axios_1.default
        .post(`https://vasapp.cac.gov.ng/api/vas/engine/pre/bn-compliance`, {
        proposedName: name,
        lineOfBusiness: business,
    }, {
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X_API_KEY": process.env.CAC_API_KEY,
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
const BusinessVerify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, business } = req.body;
        const { error } = Validator_1.BusinessSchema.validate(req.body);
        if (error)
            return (0, response_1.errorResponse)(res, `Validation error: ${error.details[0].message}`, { error: error.details[0].message }, 400);
        const response = yield CheckCACName(name, business);
        return (0, response_1.successResponse)(res, "CAC Check successful", { response }, 200);
    }
    catch (error) {
        return (0, response_1.errorResponse)(res, "Internal Server Error", { error: error.message }, 500);
    }
});
exports.BusinessVerify = BusinessVerify;
