import { BaseService } from './base.service.js';
import { AppError } from '../utils/AppError.js';
import { generateSlug } from '../utils/slug.js';

export interface CreateCategoryInput {
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  slug?: string;
}

export class CategoryService extends BaseService {
  async getCategories() {
    return this.db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async getCategoryById(idOrSlug: string) {
    const category = await this.db.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw AppError.notFound('Category not found');
    }

    return category;
  }

  async createCategory(input: CreateCategoryInput) {
    const name = input.name.trim();
    const slug = input.slug ? generateSlug(input.slug) : generateSlug(name);

    if (!slug) {
      throw AppError.badRequest('Invalid category name or slug');
    }

    const existing = await this.db.category.findFirst({
      where: {
        OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }],
      },
    });

    if (existing) {
      if (existing.name.toLowerCase() === name.toLowerCase()) {
        throw AppError.conflict(`Category with name '${name}' already exists`);
      }
      throw AppError.conflict(`Category with slug '${slug}' already exists`);
    }

    return this.db.category.create({
      data: {
        name,
        slug,
        description: input.description?.trim() || null,
      },
    });
  }

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const category = await this.db.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw AppError.notFound('Category not found');
    }

    const updateData: { name?: string; slug?: string; description?: string | null } = {};

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }

    if (input.slug !== undefined) {
      updateData.slug = generateSlug(input.slug);
    } else if (input.name !== undefined && input.name.trim() !== category.name) {
      updateData.slug = generateSlug(input.name);
    }

    if (input.description !== undefined) {
      updateData.description = input.description.trim() || null;
    }

    // Check collision if name or slug changes
    if (updateData.name || updateData.slug) {
      const orConditions: Array<{ name?: { equals: string; mode: 'insensitive' }; slug?: string }> = [];
      if (updateData.name) {
        orConditions.push({ name: { equals: updateData.name, mode: 'insensitive' } });
      }
      if (updateData.slug) {
        orConditions.push({ slug: updateData.slug });
      }

      const existing = await this.db.category.findFirst({
        where: {
          OR: orConditions,
          NOT: { id },
        },
      });

      if (existing) {
        if (updateData.name && existing.name.toLowerCase() === updateData.name.toLowerCase()) {
          throw AppError.conflict(`Category with name '${updateData.name}' already exists`);
        }
        throw AppError.conflict(`Category with slug '${updateData.slug}' already exists`);
      }
    }

    return this.db.category.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCategory(id: string) {
    const category = await this.db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw AppError.notFound('Category not found');
    }

    if (category._count.products > 0) {
      throw AppError.conflict(`Cannot delete category '${category.name}' because it contains ${category._count.products} associated product(s)`);
    }

    await this.db.category.delete({
      where: { id },
    });

    return { id, message: 'Category deleted successfully' };
  }
}

export const categoryService = new CategoryService();
