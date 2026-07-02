import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/response";
import { createQuoteSchema, updateQuoteSchema } from "./quotes.schema";
import * as quotesService from "./quotes.service";

export async function getTodayQuoteHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quote = await quotesService.getTodayQuote();
    sendSuccess(res, quote);
  } catch (error) {
    next(error);
  }
}

export async function getAllQuotesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quotes = await quotesService.getAllQuotes();
    sendSuccess(res, quotes);
  } catch (error) {
    next(error);
  }
}

export async function createQuoteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createQuoteSchema.parse(req.body);
    const quote = await quotesService.createQuote(data);
    sendSuccess(res, quote, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateQuoteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = updateQuoteSchema.parse(req.body) as any;
    const quote = await quotesService.updateQuote(req.params.id as string, data);
    sendSuccess(res, quote);
  } catch (error) {
    next(error);
  }
}
