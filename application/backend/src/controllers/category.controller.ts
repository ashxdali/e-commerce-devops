import { Request, Response } from 'express';
import { categoryService } from '../services/category.service.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCategoriesHandler = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const categories = await categoryService.getCategories();
  sendSuccess(res, categories, 200);
});

export const getCategoryByIdHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const category = await categoryService.getCategoryById(req.params.id);
  sendSuccess(res, category, 200);
});

export const createCategoryHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const category = await categoryService.createCategory(req.body);
  sendSuccess(res, category, 201);
});

export const updateCategoryHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  sendSuccess(res, category, 200);
});

export const deleteCategoryHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await categoryService.deleteCategory(req.params.id);
  sendSuccess(res, result, 200);
});
