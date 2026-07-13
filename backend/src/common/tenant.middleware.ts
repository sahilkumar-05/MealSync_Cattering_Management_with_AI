import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantIdFromHeader = req.headers['x-tenant-id'] as string;

    if (!tenantIdFromHeader) {
      throw new ForbiddenException('X-Tenant-ID header is required');
    }

    // req.user abhi tak nahi hoga (JWT guard baad mein chalta hai)
    // isliye hum tenantId ko request pe attach kar dete hain, controller mein compare karenge
    (req as any).tenantIdFromHeader = tenantIdFromHeader;
    next();
  }
}