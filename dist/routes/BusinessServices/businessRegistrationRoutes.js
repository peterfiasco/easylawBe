"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BusinessRegistrationController_1 = require("../../controllers/BusinessServices/BusinessRegistrationController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
console.log('🔍 Creating business registration router...');
const router = (0, express_1.Router)();
// Add a test route to verify the router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Business registration routes are working!' });
});
// Get user's registrations
router.get('/user-registrations', authMiddleware_1.authMiddleware, BusinessRegistrationController_1.BusinessRegistrationController.getUserRegistrations);
// Submit registration request
router.post('/submit', authMiddleware_1.authMiddleware, BusinessRegistrationController_1.BusinessRegistrationController.submitRegistrationRequest);
// Get registration status
router.get('/status/:reference_number', authMiddleware_1.authMiddleware, BusinessRegistrationController_1.BusinessRegistrationController.getRegistrationStatus);
// Get registration details
router.get('/:reference_number', authMiddleware_1.authMiddleware, BusinessRegistrationController_1.BusinessRegistrationController.getRegistrationDetails);
// Update registration
router.put('/:reference_number', authMiddleware_1.authMiddleware, BusinessRegistrationController_1.BusinessRegistrationController.updateRegistration);
// Cancel registration
router.delete('/:reference_number', authMiddleware_1.authMiddleware, BusinessRegistrationController_1.BusinessRegistrationController.cancelRegistration);
console.log('✅ Business registration router created with routes');
// 🔥 MAKE SURE YOU EXPORT DEFAULT
exports.default = router;
