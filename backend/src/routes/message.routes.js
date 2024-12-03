import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserForSidebar , getusermessages , sendmessage} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users",protectRoute,getUserForSidebar);

router.get("/:id",protectRoute,getusermessages);

router.post("/send/:id",protectRoute,sendmessage);


export default router;