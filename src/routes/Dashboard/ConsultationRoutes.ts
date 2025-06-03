import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';

import { 
  BookConsultation, 
  GetConsultationTypes, 
  SendBookingConfirmation 
} from '../../controllers/Dashboard/ConsultationController';
import { BusinessVerify } from '../../controllers/Dashboard/BusinessVerifyController';
import { AIGetAllHistory, AIGetChatHistory, AIRequestControl } from '../../controllers/AI/AlSearchController';
import { PublicAvailabilityController } from '../../controllers/Consultation/AvailabilityController';

const Consultationrouter = express.Router();

// Public endpoint for consultation types - no middleware
Consultationrouter.get('/types', GetConsultationTypes);

// ✅ FIXED - Change route to match frontend expectation
Consultationrouter.post('/book', authMiddleware, BookConsultation);  // Changed from '/book-consultation'
Consultationrouter.post('/send-confirmation', authMiddleware, SendBookingConfirmation);

// Existing endpoints
Consultationrouter.post('/check-cac', authMiddleware, BusinessVerify);
Consultationrouter.post('/ai-chat/:chat_id?', authMiddleware, AIRequestControl);
Consultationrouter.get('/get-aichat-history', authMiddleware, AIGetAllHistory);
Consultationrouter.get('/get-aichat-messagehistory/:chat_id', authMiddleware, AIGetChatHistory);

// Availability endpoints
Consultationrouter.get('/available-time-slots', PublicAvailabilityController.getAvailableTimeSlots);
Consultationrouter.get('/check-date-availability/:date', PublicAvailabilityController.checkDateAvailability);
Consultationrouter.get('/unavailable-time-slots/:date', PublicAvailabilityController.getUnavailableTimeSlots);

export default Consultationrouter;
