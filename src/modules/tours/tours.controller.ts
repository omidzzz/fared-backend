import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import { tourEnquirySchema } from "./tours.schema";
import * as toursService from "./tours.service";

export async function getToursHandler(_req: Request, res: Response, next: NextFunction) {
  try { const tours = await toursService.getTours(); sendSuccess(res, tours); } catch (e) { next(e); }
}
export async function getTourBySlugHandler(req: Request, res: Response, next: NextFunction) {
  try { const tour = await toursService.getTourBySlug(req.params.slug as string); sendSuccess(res, tour); } catch (e) { next(e); }
}
export async function submitEnquiryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = tourEnquirySchema.parse(req.body);
    const enquiry = await toursService.submitEnquiry(data);
    sendSuccess(res, enquiry, 201, "Enquiry submitted successfully. We will contact you soon.");
  } catch (e) { next(e); }
}
