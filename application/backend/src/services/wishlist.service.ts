import { BaseService } from './base.service.js';
import { AppError } from '../utils/AppError.js';

export class WishlistService extends BaseService {
  async getWishlist(userId: string) {
    const wishlist = await this.db.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                },
                category: true,
                inventory: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const items = wishlist.items.map((item) => {
      const price = Number(item.product.price);
      const compareAtPrice = item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null;
      const availableStock = item.product.inventory
        ? Math.max(0, item.product.inventory.quantity - item.product.inventory.reservedQuantity)
        : 0;

      return {
        id: item.id,
        wishlistId: item.wishlistId,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          description: item.product.description,
          price,
          compareAtPrice,
          sku: item.product.sku,
          categoryId: item.product.categoryId,
          isActive: item.product.isActive,
          images: item.product.images,
          category: item.product.category,
          availableStock,
        },
        createdAt: item.createdAt,
      };
    });

    return {
      id: wishlist.id,
      userId: wishlist.userId,
      items,
      itemCount: items.length,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  async addItemToWishlist(userId: string, productId: string) {
    const product = await this.db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    if (!product.isActive) {
      throw AppError.badRequest('Product is not active');
    }

    const wishlist = await this.db.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existing = await this.db.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (!existing) {
      await this.db.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
    }

    return this.getWishlist(userId);
  }

  async removeWishlistItem(userId: string, productId: string) {
    const wishlist = await this.db.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      throw AppError.notFound('Wishlist not found');
    }

    const item = await this.db.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (!item) {
      throw AppError.notFound('Product not found in wishlist');
    }

    await this.db.wishlistItem.delete({
      where: { id: item.id },
    });

    return this.getWishlist(userId);
  }

  async clearWishlist(userId: string) {
    const wishlist = await this.db.wishlist.findUnique({
      where: { userId },
    });

    if (wishlist) {
      await this.db.wishlistItem.deleteMany({
        where: { wishlistId: wishlist.id },
      });
    }

    return this.getWishlist(userId);
  }
}

export const wishlistService = new WishlistService();
