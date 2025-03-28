import express from 'express';
import { UserMiddleware } from '../../middleware/authMiddleware';
import { FetchUserDetails, UpdateSettings } from '../../controllers/Dashboard/SettingController';

const Dashboardrouter = express.Router();

Dashboardrouter.put('/update', UserMiddleware, UpdateSettings);
Dashboardrouter.get('/user', UserMiddleware, FetchUserDetails);

export default Dashboardrouter;
