/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  'organization:read', 'organization:update', 'organization:manage_members',
  'user:read', 'user:create', 'user:update', 'user:delete',
  'role:read', 'role:manage',
  'company:manage', 'site:manage', 'warehouse:read', 'warehouse:manage',
  'product:read', 'product:manage', 'category:manage',
  'supplier:read', 'supplier:manage',
  'purchase:read', 'purchase:create', 'purchase:approve', 'purchase:cancel',
  'receipt:read', 'receipt:create', 'receipt:confirm',
  'stock:read', 'stock:move', 'stock:adjust', 'stock:transfer',
  'inventory:read', 'inventory:manage', 'inventory:validate',
  'dashboard:read', 'report:read', 'report:export',
  'audit:read',
];

async function main() {
  console.log('🌱 Démarrage du seed GESTOCK…');

  await prisma.organization.deleteMany({ where: { slug: 'demo' } });

  const organization = await prisma.organization.create({
    data: {
      slug: 'demo',
      legalName: 'GESTOCK Démo SARL',
      displayName: 'GESTOCK Démo',
      country: 'CI',
      defaultLocale: 'fr',
      defaultCurrency: 'XOF',
      timezone: 'Africa/Abidjan',
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      organizationId: organization.id,
      key: 'ORG_ADMIN',
      name: 'Administrateur',
      description: 'Accès complet',
      isSystem: true,
      permissions: ALL_PERMISSIONS,
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      organizationId: organization.id,
      key: 'MANAGER',
      name: 'Manager',
      isSystem: true,
      permissions: ALL_PERMISSIONS.filter(
        (p) => !['user:delete', 'role:manage', 'organization:manage_members'].includes(p),
      ),
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      organizationId: organization.id,
      key: 'VIEWER',
      name: 'Consultation',
      isSystem: true,
      permissions: ALL_PERMISSIONS.filter((p) => p.endsWith(':read')),
    },
  });

  const passwordHash = await bcrypt.hash('Demo1234!', 12);

  await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'admin@gestock.io',
      passwordHash,
      firstName: 'Awa',
      lastName: 'Koné',
      status: 'ACTIVE',
      userRoles: { create: [{ roleId: adminRole.id }] },
    },
  });

  await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'manager@gestock.io',
      passwordHash,
      firstName: 'Pierre',
      lastName: 'Diabaté',
      status: 'ACTIVE',
      userRoles: { create: [{ roleId: managerRole.id }] },
    },
  });

  await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'viewer@gestock.io',
      passwordHash,
      firstName: 'Fatou',
      lastName: 'Bamba',
      status: 'ACTIVE',
      userRoles: { create: [{ roleId: viewerRole.id }] },
    },
  });

  // Unités
  const [un, kg, ctn] = await Promise.all([
    prisma.unitOfMeasure.create({
      data: { organizationId: organization.id, code: 'UN', name: 'Unité', symbol: 'u', precision: 0 },
    }),
    prisma.unitOfMeasure.create({
      data: { organizationId: organization.id, code: 'KG', name: 'Kilogramme', symbol: 'kg', precision: 3 },
    }),
    prisma.unitOfMeasure.create({
      data: { organizationId: organization.id, code: 'CT', name: 'Carton', symbol: 'ctn', precision: 0 },
    }),
  ]);

  // Catégories
  const electro = await prisma.category.create({
    data: { organizationId: organization.id, code: 'ELEC', name: 'Électronique' },
  });
  const alim = await prisma.category.create({
    data: { organizationId: organization.id, code: 'ALIM', name: 'Alimentaire' },
  });
  const hyg = await prisma.category.create({
    data: { organizationId: organization.id, code: 'HYG', name: 'Hygiène' },
  });

  // Société / Site / Entrepôts
  const company = await prisma.company.create({
    data: {
      organizationId: organization.id,
      code: 'COMP-001',
      name: 'GESTOCK Démo SARL',
      country: 'CI',
      currency: 'XOF',
      city: 'Abidjan',
    },
  });

  const siteAbidjan = await prisma.site.create({
    data: {
      organizationId: organization.id,
      companyId: company.id,
      code: 'SITE-ABJ',
      name: 'Site Abidjan',
      city: 'Abidjan',
      country: 'CI',
    },
  });

  const siteDakar = await prisma.site.create({
    data: {
      organizationId: organization.id,
      companyId: company.id,
      code: 'SITE-DKR',
      name: 'Site Dakar',
      city: 'Dakar',
      country: 'SN',
    },
  });

  const wh1 = await prisma.warehouse.create({
    data: {
      organizationId: organization.id, siteId: siteAbidjan.id,
      code: 'WH-ABJ-01', name: 'Entrepôt Principal Abidjan', type: 'STANDARD', manager: 'Awa Koné',
    },
  });
  const wh2 = await prisma.warehouse.create({
    data: {
      organizationId: organization.id, siteId: siteAbidjan.id,
      code: 'WH-ABJ-02', name: 'Entrepôt Froid Abidjan', type: 'COLD', manager: 'Pierre Diabaté',
    },
  });
  const wh3 = await prisma.warehouse.create({
    data: {
      organizationId: organization.id, siteId: siteDakar.id,
      code: 'WH-DKR-01', name: 'Entrepôt Dakar', type: 'STANDARD',
    },
  });

  // Fournisseurs
  const supA = await prisma.supplier.create({
    data: {
      organizationId: organization.id,
      code: 'SUP-001', name: 'Sahel Distribution',
      email: 'contact@sahel.ci', phone: '+225 27 22 00 00',
      city: 'Abidjan', country: 'CI', currency: 'XOF',
      paymentTerms: 'Net 30', rating: 4,
    },
  });
  const supB = await prisma.supplier.create({
    data: {
      organizationId: organization.id,
      code: 'SUP-002', name: 'Atlantique Import',
      email: 'sales@atlantique-import.sn',
      city: 'Dakar', country: 'SN', currency: 'XOF', rating: 5,
    },
  });
  const supC = await prisma.supplier.create({
    data: {
      organizationId: organization.id,
      code: 'SUP-003', name: 'TechAfrica',
      email: 'info@techafrica.io',
      city: 'Lagos', country: 'NG', currency: 'USD', rating: 3,
    },
  });

  // Articles
  const products = await Promise.all([
    prisma.product.create({
      data: {
        organizationId: organization.id, sku: 'PRD-0001', name: 'Smartphone X10',
        categoryId: electro.id, unitId: un.id, brand: 'TechAfrica',
        costPrice: 95000, sellingPrice: 150000, currency: 'XOF',
        minStock: 10, maxStock: 200, reorderPoint: 30, leadTimeDays: 14,
        trackSerial: true, tags: ['mobile', 'phare'],
      },
    }),
    prisma.product.create({
      data: {
        organizationId: organization.id, sku: 'PRD-0002', name: 'Casque audio sans fil',
        categoryId: electro.id, unitId: un.id, brand: 'AudioPlus',
        costPrice: 18000, sellingPrice: 32000, currency: 'XOF',
        minStock: 20, reorderPoint: 50,
      },
    }),
    prisma.product.create({
      data: {
        organizationId: organization.id, sku: 'PRD-0003', name: 'Riz parfumé 25kg',
        categoryId: alim.id, unitId: kg.id,
        costPrice: 14000, sellingPrice: 18500, currency: 'XOF',
        minStock: 50, reorderPoint: 100, trackBatch: true, trackExpiry: true, shelfLifeDays: 365,
      },
    }),
    prisma.product.create({
      data: {
        organizationId: organization.id, sku: 'PRD-0004', name: 'Huile d\'arachide 5L',
        categoryId: alim.id, unitId: un.id,
        costPrice: 6500, sellingPrice: 8500, currency: 'XOF',
        minStock: 30, reorderPoint: 60, trackBatch: true, trackExpiry: true, shelfLifeDays: 540,
      },
    }),
    prisma.product.create({
      data: {
        organizationId: organization.id, sku: 'PRD-0005', name: 'Savon de Marseille (carton 24)',
        categoryId: hyg.id, unitId: ctn.id,
        costPrice: 8000, sellingPrice: 11000, currency: 'XOF',
        minStock: 10, reorderPoint: 25,
      },
    }),
  ]);

  // Stock initial dans WH1
  for (const product of products) {
    const qty = Math.floor(Math.random() * 150) + 20;
    await prisma.stockItem.create({
      data: {
        organizationId: organization.id, warehouseId: wh1.id, productId: product.id,
        quantity: qty, avgCost: Number(product.costPrice),
      },
    });
    await prisma.stockMovement.create({
      data: {
        organizationId: organization.id, productId: product.id, type: 'RECEIPT',
        quantity: qty, unitCost: Number(product.costPrice),
        toWarehouseId: wh1.id, reference: 'SEED', reason: 'Stock initial démo',
      },
    });
  }

  // Quelques liens fournisseur-produit
  await prisma.productSupplier.createMany({
    data: [
      { productId: products[0].id, supplierId: supC.id, isPreferred: true, leadTimeDays: 21, unitPrice: 92000 },
      { productId: products[1].id, supplierId: supC.id, isPreferred: true, unitPrice: 17500 },
      { productId: products[2].id, supplierId: supA.id, isPreferred: true, unitPrice: 13500 },
      { productId: products[3].id, supplierId: supA.id, isPreferred: true, unitPrice: 6400 },
      { productId: products[4].id, supplierId: supB.id, isPreferred: true, unitPrice: 7800 },
    ],
  });

  console.log('✅ Seed terminé.');
  console.log('   Org: demo / Admin: admin@gestock.io / Mot de passe: Demo1234!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur de seed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
