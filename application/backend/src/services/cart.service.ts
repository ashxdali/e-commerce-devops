import { BaseService } from './base.service.js';
import { AppError } from '../utils/AppError.js';

export class CartService extends BaseService {
  async getCart(userId: string) {
    const cart = await this.db.cart.upsert({
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

    let subtotal = 0;
    let totalItems = 0;

    const items = cart.items.map((item) => {
      const price = Number(item.product.price);
      const compareAtPrice = item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      totalItems += item.quantity;

      const availableStock = item.product.inventory
        ? Math.max(0, item.product.inventory.quantity - item.product.inventory.reservedQuantity)
        : 0;

      return {
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: price,
        subtotal: Number(itemSubtotal.toFixed(2)),
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
        updatedAt: item.updatedAt,
      };
    });

    const formattedSubtotal = Number(subtotal.toFixed(2));

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      itemCount: items.length,
      totalItems,
      subtotal: formattedSubtotal,
      total: formattedSubtotal,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  async addItemToCart(userId: string, productId: string, quantity: number = 1) {
    if (quantity < 1) {
      throw AppError.badRequest('Quantity must be at least 1');
    }

    const product = await this.db.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    if (!product.isActive) {
      throw AppError.badRequest('Product is not active');
    }

    const availableStock = product.inventory
      ? Math.max(0, product.inventory.quantity - product.inventory.reservedQuantity)
      : 0;

    const cart = await this.db.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existingItem = await this.db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const targetQuantity = currentQuantity + quantity;

    if (targetQuantity > availableStock) {
      throw AppError.badRequest(
        `Requested total quantity (${targetQuantity}) exceeds available stock (${availableStock})`,
        'INSUFFICIENT_STOCK'
      );
    }

    if (existingItem) {
      await this.db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: targetQuantity },
      });
    } else {
      await this.db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateCartItemQuantity(userId: string, productId: string, quantity: number) {
    if (quantity < 1) {
      throw AppError.badRequest('Quantity must be at least 1');
    }

    const cart = await this.db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw AppError.notFound('Cart not found');
    }

    const item = await this.db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      include: {
        product: {
          include: { inventory: true },
        },
      },
    });

    if (!item) {
      throw AppError.notFound('Product not found in cart');
    }

    if (!item.product.isActive) {
      throw AppError.badRequest('Product is not active');
    }

    const availableStock = item.product.inventory
      ? Math.max(0, item.product.inventory.quantity - item.product.inventory.reservedQuantity)
      : 0;

    if (quantity > availableStock) {
      throw AppError.badRequest(
        `Requested quantity (${quantity}) exceeds available stock (${availableStock})`,
        'INSUFFICIENT_STOCK'
      );
    }

    await this.db.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeCartItem(userId: string, productId: string) {
    const cart = await this.db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw AppError.notFound('Cart not found');
    }

    const item = await this.db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!item) {
      throw AppError.notFound('Product not found in cart');
    }

    await this.db.cartItem.delete({
      where: { id: item.id },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.db.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this.db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return this.getCart(userId);
  }
}

export const cartService = new CartService();
