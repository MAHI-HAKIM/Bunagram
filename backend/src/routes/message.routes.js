import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    getUsersForSidebar , 
    getMessages ,
    sendMessage ,
    sendGroupMessage ,  
    fetchGroupParticipants ,
    broadcastMessage
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);

router.get("/:id", protectRoute, getMessages);

router.get("/participants/:id", protectRoute, fetchGroupParticipants);

router.post("/send/:id",protectRoute,sendMessage);

router.post("/groupMessage/send/:id",protectRoute,sendGroupMessage);

router.post("/broadcast",protectRoute,broadcastMessage);


export default router;