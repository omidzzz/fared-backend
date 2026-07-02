import { Router } from "express";
import { getToursHandler, getTourBySlugHandler, submitEnquiryHandler } from "./tours.controller";

const router = Router();

router.get("/", getToursHandler);
router.get("/:slug", getTourBySlugHandler);
router.post("/enquiry", submitEnquiryHandler);

export default router;
