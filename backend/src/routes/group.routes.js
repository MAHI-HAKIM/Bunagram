import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import {createGroup, getGroupsForSidebar , getSelectedGroupMembers} from "../controllers/groups.controller.js";

const router = express.Router();

router.post("/create-group", protectRoute, createGroup);
router.get("/groups/:id", protectRoute, getGroupsForSidebar);
router.get("/groups/group-members/:id", protectRoute, getSelectedGroupMembers);


export default router;