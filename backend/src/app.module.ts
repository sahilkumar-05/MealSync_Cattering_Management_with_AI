import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { CohortsModule } from './cohorts/cohorts.module';
import { DietaryProfilesModule } from './dietary-profiles/dietary-profiles.module';
import { MenusModule } from './menus/menus.module';
import { ProcurementModule } from './procurement/procurement.module';
import { WasteModule } from './waste/waste.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiModule } from './ai/ai.module';
import { MealOrdersModule } from './meal-orders/meal-orders.module';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import { Ingredient } from './entities/ingredient.entity';
import { Cohort } from './entities/cohort.entity';
import { DietaryProfile } from './entities/dietary-profile.entity';
import { Menu } from './entities/menu.entity';
import { MenuItem } from './entities/menu-item.entity';
import { ProcurementOrder } from './entities/procurement-order.entity';
import { WasteLog } from './entities/waste-log.entity';
import { MealOrder } from './entities/meal-order.entity';
import { TenantMiddleware } from './common/tenant.middleware';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User,
        Tenant,
        Ingredient,
        Cohort,
        DietaryProfile,
        Menu,
        MenuItem,
        ProcurementOrder,
        WasteLog,
        MealOrder,
        TenantsModule,
      ],
      autoLoadEntities: true,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
    AuthModule,
    IngredientsModule,
    CohortsModule,
    DietaryProfilesModule,
    MenusModule,
    ProcurementModule,
    WasteModule,
    NotificationsModule,
    AiModule,
    MealOrdersModule,
    TenantsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'tenants', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}