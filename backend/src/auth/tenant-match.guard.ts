import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantMatchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userTenantId = request.user?.tenantId;
    const headerTenantId = request.tenantIdFromHeader;

    if (userTenantId !== headerTenantId) {
      throw new ForbiddenException('Tenant mismatch — access denied');
    }
    return true;
  }
}