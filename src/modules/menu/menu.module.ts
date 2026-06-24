import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MENU_USECASES } from './core/interfaces/primary/menu.use-cases.interface';
import { MENU_REPOSITORY } from './core/interfaces/secondary/menu.repository.interface';
import { MenuRepository } from './infra/database/repository/menu.repository';

@Module({
  controllers: [MenuController],
  providers: [
    MenuService,
    { provide: MENU_USECASES, useExisting: MenuService },
    MenuRepository,
    { provide: MENU_REPOSITORY, useExisting: MenuRepository },
  ],
  exports: [MENU_USECASES, MENU_REPOSITORY],
})
export class MenuModule {}
