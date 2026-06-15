import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from './shared/config/env.config';
import { DatabaseModule } from './shared/database/database.module';
import { GlobalExceptionFilter } from './shared/common/global-exception.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { TenantAccessGuard } from './modules/auth/guards/tenant-access.guard';
import { TenantModule } from './shared/tenant/tenant.module';
import { TenantMiddleware } from './shared/tenant/tenant.middleware';
import { PlatformModule } from './modules/platform/platform.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { DispatchesModule } from './modules/dispatches/dispatches.module';
import { FinanceModule } from './modules/finance/finance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductionModule } from './modules/production/production.module';
import { ReportsModule } from './modules/reports/reports.module';
import { LedgerModule } from './shared/ledger/ledger.module';
import { FulfillmentModule } from './shared/fulfillment/fulfillment.module';
import { StockModule } from './shared/stock/stock.module';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    DatabaseModule,
    LedgerModule,
    FulfillmentModule,
    StockModule,
    TenantModule,
    AuthModule,
    PlatformModule,
    CustomersModule,
    CatalogModule,
    OrdersModule,
    FleetModule,
    DispatchesModule,
    FinanceModule,
    DashboardModule,
    InventoryModule,
    ProductionModule,
    ReportsModule,
    SettingsModule,
  ],
  controllers: [HealthController],
  providers: [
    JwtAuthGuard,
    TenantAccessGuard,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: TenantAccessGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
