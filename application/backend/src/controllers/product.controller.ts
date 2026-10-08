import { Request, Response } from 'express';
import { productService, GetProductsQuery } from '../services/product.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProductsHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const query = req.query as unknown as GetProductsQuery;
  const result = await productService.getProducts(query);
  sendPaginated(res, result.items, result.pagination, 200);
});

export const getProductByIdHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const isPublic = !req.user || req.user.role !== 'ADMIN';
  const product = await productService.getProductById(req.params.id, isPublic);
  sendSuccess(res, product, 200);
});

export const createProductHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const product = await productService.createProduct(req.body);
  sendSuccess(res, product, 201);
});

export const updateProductHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, product, 200);
});

export const deleteProductHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await productService.deleteProduct(req.params.id);
  sendSuccess(res, result, 200);
});
