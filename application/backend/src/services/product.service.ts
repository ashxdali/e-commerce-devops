import { BaseService } from './base.service.js';
import { AppError } from '../utils/AppError.js';
import { generateSlug } from '../utils/slug.js';
import { Prisma } from '@prisma/client';

export interface GetProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface ProductImageInput {
  url: string;
  altText?: string;
  sortOrder?: number;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  sku: string;
  categoryId: string;
  isActive?: boolean;
  images?: ProductImageInput[];
  stockQuantity?: number;
  inventory?: {
    quantity: number;
  };
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number | null;
  sku?: string;
  categoryId?: string;
  isActive?: boolean;
  images?: ProductImageInput[];
  stockQuantity?: number;
  inventory?: {
    quantity: number;
  };
}

export class ProductService extends BaseService {
  async getProducts(query: GetProductsQuery) {
    const page = query.page && query.page >= 1 ? query.page : 1;
    const limit = query.limit && query.limit >= 1 ? Math.min(query.limit, 100) : 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    // Active status filter: default to true if unspecified in public request
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    } else {
      where.isActive = true;
    }

    // Category filter
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    // Search filter across name, description, and SKU
    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Price filtering using Decimal comparison
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(query.minPrice);
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(query.maxPrice);
      }
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [items, total] = await this.db.$transaction([
      this.db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          inventory: {
            select: { quantity: true, reservedQuantity: true },
          },
        },
      }),
      this.db.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getProductById(idOrSlug: string, isPublicRequest: boolean = true) {
    const product = await this.db.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, description: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        inventory: {
          select: { quantity: true, reservedQuantity: true },
        },
      },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    if (isPublicRequest && !product.isActive) {
      throw AppError.notFound('Product not found');
    }

    return product;
  }

  async createProduct(input: CreateProductInput) {
    // 1. Validate category existence
    const category = await this.db.category.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw AppError.badRequest(`Category with ID '${input.categoryId}' does not exist`);
    }

    // 2. Validate SKU uniqueness
    const existingSku = await this.db.product.findUnique({
      where: { sku: input.sku.trim() },
    });

    if (existingSku) {
      throw AppError.conflict(`Product with SKU '${input.sku}' already exists`);
    }

    // 3. Generate unique slug
    let slug = generateSlug(input.name);
    if (!slug) {
      throw AppError.badRequest('Invalid product name');
    }

    const existingSlug = await this.db.product.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // 4. Resolve stock quantity
    const quantity = input.stockQuantity ?? input.inventory?.quantity ?? 0;

    // 5. Create product with images and inventory
    return this.db.product.create({
      data: {
        name: input.name.trim(),
        slug,
        description: input.description.trim(),
        price: new Prisma.Decimal(input.price),
        compareAtPrice: input.compareAtPrice ? new Prisma.Decimal(input.compareAtPrice) : null,
        sku: input.sku.trim(),
        categoryId: input.categoryId,
        isActive: input.isActive ?? true,
        images: {
          create: (input.images || []).map((img, idx) => ({
            url: img.url,
            altText: img.altText?.trim() || null,
            sortOrder: img.sortOrder ?? idx,
          })),
        },
        inventory: {
          create: {
            quantity,
            reservedQuantity: 0,
          },
        },
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        inventory: {
          select: { quantity: true, reservedQuantity: true },
        },
      },
    });
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    // 1. Check existing product
    const existingProduct = await this.db.product.findUnique({
      where: { id },
      include: { inventory: true },
    });

    if (!existingProduct) {
      throw AppError.notFound('Product not found');
    }

    // 2. Validate category if provided
    if (input.categoryId && input.categoryId !== existingProduct.categoryId) {
      const category = await this.db.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw AppError.badRequest(`Category with ID '${input.categoryId}' does not exist`);
      }
    }

    // 3. Validate SKU if provided
    if (input.sku && input.sku.trim() !== existingProduct.sku) {
      const existingSku = await this.db.product.findUnique({
        where: { sku: input.sku.trim() },
      });
      if (existingSku) {
        throw AppError.conflict(`Product with SKU '${input.sku}' already exists`);
      }
    }

    // 4. Update slug if name changes
    let slug = existingProduct.slug;
    if (input.name && input.name.trim() !== existingProduct.name) {
      const newSlug = generateSlug(input.name);
      if (newSlug !== existingProduct.slug) {
        const slugCheck = await this.db.product.findUnique({
          where: { slug: newSlug },
        });
        slug = slugCheck ? `${newSlug}-${Date.now().toString(36)}` : newSlug;
      }
    }

    const updateData: Prisma.ProductUpdateInput = {};

    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.description !== undefined) updateData.description = input.description.trim();
    if (input.price !== undefined) updateData.price = new Prisma.Decimal(input.price);
    if (input.compareAtPrice !== undefined) {
      updateData.compareAtPrice = input.compareAtPrice !== null ? new Prisma.Decimal(input.compareAtPrice) : null;
    }
    if (input.sku !== undefined) updateData.sku = input.sku.trim();
    if (input.categoryId !== undefined) {
      updateData.category = { connect: { id: input.categoryId } };
    }
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    updateData.slug = slug;

    // Execute updates in transaction
    await this.db.$transaction(async (tx) => {
      // Update images if provided
      if (input.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (input.images.length > 0) {
          await tx.productImage.createMany({
            data: input.images.map((img, idx) => ({
              productId: id,
              url: img.url,
              altText: img.altText?.trim() || null,
              sortOrder: img.sortOrder ?? idx,
            })),
          });
        }
      }

      // Update inventory correctly on existing record rather than recreating
      const newQuantity = input.stockQuantity ?? input.inventory?.quantity;
      if (newQuantity !== undefined) {
        if (existingProduct.inventory) {
          await tx.inventory.update({
            where: { productId: id },
            data: { quantity: newQuantity },
          });
        } else {
          await tx.inventory.create({
            data: {
              productId: id,
              quantity: newQuantity,
              reservedQuantity: 0,
            },
          });
        }
      }

      // Update main product entity
      await tx.product.update({
        where: { id },
        data: updateData,
      });
    });

    return this.getProductById(id, false);
  }

  async deleteProduct(id: string) {
    const product = await this.db.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    // Soft deletion: deactivate product to preserve order history & references
    const updated = await this.db.product.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      id: updated.id,
      isActive: updated.isActive,
      message: 'Product deactivated successfully',
    };
  }
}

export const productService = new ProductService();
