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
exports.verifyAddress = exports.verifyProperty = exports.verifyCacBasic = void 0;
const axios_1 = __importDefault(require("axios"));
// Normally, we'd use environment variables for these values
const QOREID_BASE_URL = process.env.QOREID_BASEURL || 'https://api.qoreid.com';
const QOREID_CLIENT_ID = process.env.QOREID_CLIENTID_KEY;
const QOREID_SECRET_KEY = process.env.QOREID_SECRET_KEY;
// Create axios instance with default config
const qoreidApi = axios_1.default.create({
    baseURL: QOREID_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'clientId': QOREID_CLIENT_ID,
        'x-api-key': QOREID_SECRET_KEY
    }
});
// CAC Basic Verification
const verifyCacBasic = (regNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield qoreidApi.post('/v1/ng/identities/cac-basic', {
            regNumber
        });
        return response.data;
    }
    catch (error) {
        console.error('CAC Basic Verification Error:', error);
        throw error;
    }
});
exports.verifyCacBasic = verifyCacBasic;
// Property Verification
const verifyProperty = (propertyData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield qoreidApi.post('/v1/properties', propertyData);
        return response.data;
    }
    catch (error) {
        console.error('Property Verification Error:', error);
        throw error;
    }
});
exports.verifyProperty = verifyProperty;
// Address Verification
const verifyAddress = (addressData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield qoreidApi.post('/v1/addresses', addressData);
        return response.data;
    }
    catch (error) {
        console.error('Address Verification Error:', error);
        throw error;
    }
});
exports.verifyAddress = verifyAddress;
exports.default = {
    verifyCacBasic: exports.verifyCacBasic,
    verifyProperty: exports.verifyProperty,
    verifyAddress: exports.verifyAddress
};
