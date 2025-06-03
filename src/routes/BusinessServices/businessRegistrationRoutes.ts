import { Router } from 'express';
import { BusinessRegistrationController } from '../../controllers/BusinessServices/BusinessRegistrationController';
import { authMiddleware } from '../../middleware/authMiddleware';

console.log('🔍 Creating business registration router...');

const router = Router();

// Add a test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Business registration routes are working!' });
});

// Get user's registrations
router.get('/user-registrations', authMiddleware, BusinessRegistrationController.getUserRegistrations);

// Submit registration request
router.post('/submit', authMiddleware, BusinessRegistrationController.submitRegistrationRequest);

// Get registration status
router.get('/status/:reference_number', authMiddleware, BusinessRegistrationController.getRegistrationStatus);

// Get registration details
router.get('/:reference_number', authMiddleware, BusinessRegistrationController.getRegistrationDetails);

// Update registration
router.put('/:reference_number', authMiddleware, BusinessRegistrationController.updateRegistration);

// Cancel registration
router.delete('/:reference_number', authMiddleware, BusinessRegistrationController.cancelRegistration);

console.log('✅ Business registration router created with routes');

// 🔥 MAKE SURE YOU EXPORT DEFAULT
export default router;