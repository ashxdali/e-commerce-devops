import { PrismaClient, Role, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing seed data in reverse dependency order
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // Hash demo passwords using bcrypt (10 rounds)
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const customerPasswordHash = await bcrypt.hash('CustomerPass123!', 10);

  // 1. Create Demo Users
  // NOTE: These are local development credentials only. Never use in production.
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@ecommerce.dev',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      phone: '+1-555-0100',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: 'Demo Customer',
      email: 'customer@ecommerce.dev',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      phone: '+1-555-0199',
      addresses: {
        create: [
          {
            fullName: 'Demo Customer',
            phone: '+1-555-0199',
            addressLine1: '742 Evergreen Terrace',
            addressLine2: 'Apt 4B',
            city: 'Springfield',
            state: 'OR',
            postalCode: '97477',
            country: 'United States',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log(`👤 Created Demo Users: ${adminUser.email} (ADMIN), ${customerUser.email} (CUSTOMER)`);

  // 2. Create Categories
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electronics & Gadgets',
      slug: 'electronics',
      description: 'High quality gadgets, headphones, and developer accessories.',
    },
  });

  const apparelCategory = await prisma.category.create({
    data: {
      name: 'Apparel & Wearables',
      slug: 'apparel',
      description: 'Comfortable clothing and merchandise designed for software engineers.',
    },
  });

  const homeCategory = await prisma.category.create({
    data: {
      name: 'Home & Office Setup',
      slug: 'home-office',
      description: 'Ergonomic furniture and lighting for your workspace.',
    },
  });

  console.log('📦 Created Categories: Electronics, Apparel, Home & Office');

  // 3. Create Products & Inventory & Images
  const productsData = [
    {
      name: 'Wireless Pro Noise-Canceling Headphones',
      slug: 'wireless-pro-noise-canceling-headphones',
      description: 'Premium active noise-canceling headphones with 40-hour battery life and crisp studio sound.',
      price: 199.99,
      compareAtPrice: 249.99,
      sku: 'AUDIO-HEADPHONE-PRO1',
      categoryId: electronicsCategory.id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
          altText: 'Wireless Pro Noise-Canceling Headphones Black',
          sortOrder: 0,
        },
      ],
      stockQuantity: 45,
    },
    {
      name: 'Ergonomic Hot-Swappable Mechanical Keyboard',
      slug: 'ergonomic-mechanical-keyboard',
      description: 'RGB mechanical keyboard featuring tactile switches, PBT keycaps, and customizable macros.',
      price: 129.50,
      compareAtPrice: 150.00,
      sku: 'PERIPH-KEYBOARD-RGB1',
      categoryId: electronicsCategory.id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
          altText: 'Ergonomic Mechanical Keyboard Top View',
          sortOrder: 0,
        },
      ],
      stockQuantity: 80,
    },
    {
      name: 'Organic Cotton Developer Hoodie',
      slug: 'organic-cotton-developer-hoodie',
      description: 'Ultra-soft 100% organic cotton fleece hoodie tailored for cold coding nights.',
      price: 65.00,
      compareAtPrice: null,
      sku: 'APP-HOODIE-DEV-L',
      categoryId: apparelCategory.id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
          altText: 'Organic Cotton Developer Hoodie Front',
          sortOrder: 0,
        },
      ],
      stockQuantity: 120,
    },
    {
      name: 'Smart Ambient Desk Light bar',
      slug: 'smart-ambient-desk-light-bar',
      description: 'Eye-care LED monitor light bar with auto-dimming and ambient color backlighting.',
      price: 49.99,
      compareAtPrice: 59.99,
      sku: 'HOME-DESKLIGHT-01',
      categoryId: homeCategory.id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
          altText: 'Smart Ambient Desk Light',
          sortOrder: 0,
        },
      ],
      stockQuantity: 60,
    },
  ];

  for (const item of productsData) {
    await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        sku: item.sku,
        categoryId: item.categoryId,
        isActive: true,
        images: {
          create: item.images,
        },
        inventory: {
          create: {
            quantity: item.stockQuantity,
            reservedQuantity: 0,
          },
        },
      },
    });
  }

  console.log('🛍️ Created 4 Demo Products with Images and Inventories.');

  // 4. Create Sample Coupon
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      description: '10% discount on initial orders',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10.0,
      minimumOrderAmount: 30.0,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      usageLimit: 500,
      isActive: true,
    },
  });

  console.log('🎟️ Created Demo Coupon: WELCOME10');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
