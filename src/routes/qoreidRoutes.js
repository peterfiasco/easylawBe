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
router.post('/cac-basic', validateRequest(['regNumber']), async (req, res) => {
  try {
    const { regNumber } = req.body;
    
    const response = await qoreidApi.post('/v1/ng/identities/cac-basic', { regNumber });
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('CAC Basic Verification Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to verify business',
      message: error.message
    });
  }
});

// Property Verification
router.post('/property', validateRequest([
  'customerReference', 'propertyName', 'propertyType', 
  'lgaName', 'address', 'contactPerson'
]), async (req, res) => {
  try {
    const response = await qoreidApi.post('/v1/properties', req.body);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Property Verification Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to verify property',
      message: error.message
    });
  }
});

// Address Verification
router.post('/address', validateRequest([
  'customerReference', 'street', 'lgaName', 
  'stateName', 'city', 'applicant'
]), async (req, res) => {
  try {
    const response = await qoreidApi.post('/v1/addresses', req.body);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Address Verification Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to verify address',
      message: error.message
    });
  }
});

module.exports = router;