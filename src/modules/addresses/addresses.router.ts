import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getAddressesHandler,
  createAddressHandler,
  updateAddressHandler,
  deleteAddressHandler,
  setDefaultAddressHandler,
} from "./addresses.controller";

const router = Router();

router.use(authenticate);

router.get("/", getAddressesHandler);
router.post("/", createAddressHandler);
router.put("/:id", updateAddressHandler);
router.delete("/:id", deleteAddressHandler);
router.patch("/:id/default", setDefaultAddressHandler);

export default router;
