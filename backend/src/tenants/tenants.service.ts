import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
  ) {}

  async findAllPublic() {
    const tenants = await this.tenantRepo.find();
    // Sirf id aur name bhejo — kuch bhi sensitive nahi
    return tenants.map((t) => ({ id: t.id, name: t.name, emailDomain: t.emailDomain }));
  }
}