import { Router } from "express";
import { Login } from "../../controllers/Auth/RegisterController";


const authRouter = Router();

authRouter.post('/login', Login);


export default authRouter;