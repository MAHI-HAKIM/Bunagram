import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar , getMessages , sendMessage , sendGroupMessage} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);

router.get("/:id", protectRoute, getMessages);

router.post("/send/:id",protectRoute,sendMessage);

router.post("/groupMessage/send/:id",protectRoute,sendGroupMessage);

export default router;