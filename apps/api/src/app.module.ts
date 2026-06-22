import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { SitesModule } from './modules/sites/sites.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { StockModule } from './modules/stock/stock.module';
import { InventoriesModule } from './modules/inventories/inventories.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 200 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    CompaniesModule,
    SitesModule,
    WarehousesModule,
    CategoriesModule,
    ProductsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    ReceiptsModule,
    StockModule,
    InventoriesModule,
    AlertsModule,
    DashboardModule,
    AuditModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
