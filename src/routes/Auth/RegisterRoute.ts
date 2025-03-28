import express from 'express';
import { Login, Register } from '../../controllers/Auth/RegisterController';


const router = express.Router();

router.post('/create-account', Register);
// router.post('/login', Login);

module.exports = router;