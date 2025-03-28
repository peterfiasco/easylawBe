import axios from 'axios';

// Normally, we'd use environment variables for these values
const QOREID_BASE_URL = process.env.QOREID_BASEURL || 'https://api.qoreid.com';
const QOREID_CLIENT_ID = process.env.QOREID_CLIENTID_KEY;
const QOREID_SECRET_KEY = process.env.QOREID_SECRET_KEY;

// Create axios instance with default config
const qoreidApi = axios.create({
  baseURL: QOREID_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'clientId': QOREID_CLIENT_ID,
    'x-api-key': QOREID_SECRET_KEY
  }
});

// CAC Basic Verification
export const verifyCacBasic = async (regNumber) => {
  try {
    const response = await qoreidApi.post('/v1/ng/identities/cac-basic', {
      regNumber
    });
    return response.data;
  } catch (error) {
    console.error('CAC Basic Verification Error:', error);
    throw error;
  }
};

// Property Verification
export const verifyProperty = async (propertyData) => {
  try {
    const response = await qoreidApi.post('/v1/properties', propertyData);
    return response.data;
  } catch (error) {
    console.error('Property Verification Error:', error);
    throw error;
  }
};

// Address Verification
export const verifyAddress = async (addressData) => {
  try {
    const response = await qoreidApi.post('/v1/addresses', addressData);
    return response.data;
  } catch (error) {
    console.error('Address Verification Error:', error);
    throw error;
  }
};

export default {
  verifyCacBasic,
  verifyProperty,
  verifyAddress
};