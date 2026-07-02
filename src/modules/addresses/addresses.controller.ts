import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import { createAddressSchema, updateAddressSchema } from "./addresses.schema";
import * as addressesService from "./addresses.service";

export async function getAddressesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const addresses = await addressesService.getAddresses(req.user!.id);
    sendSuccess(res, addresses);
  } catch (error) {
    next(error);
  }
}

export async function createAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createAddressSchema.parse(req.body);
    const address = await addressesService.createAddress(req.user!.id, data);
    sendSuccess(res, address, 201, "Address created");
  } catch (error) {
    next(error);
  }
}

export async function updateAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = updateAddressSchema.parse(req.body);
    const address = await addressesService.updateAddress(
      req.user!.id,
      req.params.id as string,
      data
    );
    sendSuccess(res, address, 200, "Address updated");
  } catch (error) {
    next(error);
  }
}

export async function deleteAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await addressesService.deleteAddress(req.user!.id, req.params.id as string);
    sendSuccess(res, null, 200, "Address deleted");
  } catch (error) {
    next(error);
  }
}

export async function setDefaultAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const address = await addressesService.setDefaultAddress(
      req.user!.id,
      req.params.id as string
    );
    sendSuccess(res, address, 200, "Set as default address");
  } catch (error) {
    next(error);
  }
}
