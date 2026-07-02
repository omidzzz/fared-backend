import { Router } from "express";
import { callbackHandler } from "./payments.controller";

const router = Router();

router.get("/callback", callbackHandler);

export default router;
