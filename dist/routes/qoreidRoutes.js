var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { validateRequest } = require('../middlewares/validation');
// QoreID API configuration
const QOREID_BASE_URL = process.env.QOREID_BASEURL;
const QOREID_CLIENT_ID = process.env.QOREID_CLIENTID_KEY;
const QOREID_SECRET_KEY = process.env.QOREID_SECRET_KEY;
// Create instance for QoreID API
const qoreidApi = axios.create({
    baseURL: QOREID_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'clientId': QOREID_CLIENT_ID,
        'x-api-key': QOREID_SECRET_KEY
    }
});
// CAC Basic Verification
router.post('/cac-basic', validateRequest(['regNumber']), (req, res) => __awaiter(this, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { regNumber } = req.body;
        const response = yield qoreidApi.post('/v1/ng/identities/cac-basic', { regNumber });
        res.status(200).json(response.data);
    }
    catch (error) {
        console.error('CAC Basic Verification Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({
            error: ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || 'Failed to verify business',
            message: error.message
        });
    }
}));
// Property Verification
router.post('/property', validateRequest([
    'customerReference', 'propertyName', 'propertyType',
    'lgaName', 'address', 'contactPerson'
]), (req, res) => __awaiter(this, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const response = yield qoreidApi.post('/v1/properties', req.body);
        res.status(200).json(response.data);
    }
    catch (error) {
        console.error('Property Verification Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({
            error: ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || 'Failed to verify property',
            message: error.message
        });
    }
}));
// Address Verification
router.post('/address', validateRequest([
    'customerReference', 'street', 'lgaName',
    'stateName', 'city', 'applicant'
]), (req, res) => __awaiter(this, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const response = yield qoreidApi.post('/v1/addresses', req.body);
        res.status(200).json(response.data);
    }
    catch (error) {
        console.error('Address Verification Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({
            error: ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || 'Failed to verify address',
            message: error.message
        });
    }
}));
module.exports = router;
