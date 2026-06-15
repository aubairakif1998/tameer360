import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { vehicles } from '../../../shared/database/schema/vehicles';
import { parsePagination } from '../../../shared/common/pagination';
import type {
  CreateVehicleInput,
  ListVehiclesQuery,
  UpdateVehicleInput,
  VehicleRepository,
} from '../domain/vehicle.entity';
import { VEHICLE_REPOSITORY } from '../domain/vehicle.entity';
import { toVehicle } from '../domain/vehicle.mapper';

@Injectable()
export class DrizzleVehicleRepository implements VehicleRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  private buildWhere(tenantId: string, query: ListVehiclesQuery) {
    const conditions = [eq(vehicles.tenantId, tenantId)];
    if (query.isActive !== undefined) {
      conditions.push(eq(vehicles.isActive, query.isActive));
    } else {
      conditions.push(eq(vehicles.isActive, true));
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(vehicles.registrationNumber, term),
          ilike(vehicles.driverName, term),
        )!,
      );
    }
    return and(...conditions);
  }

  async findMany(tenantId: string, query: ListVehiclesQuery) {
    const { limit, offset } = parsePagination(query);
    const where = this.buildWhere(tenantId, query);
    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(vehicles)
        .where(where)
        .orderBy(desc(vehicles.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: count() }).from(vehicles).where(where),
    ]);
    return {
      items: rows.map(toVehicle),
      total: Number(totalResult[0]?.count ?? 0),
    };
  }

  async findById(tenantId: string, id: string) {
    const [row] = await this.db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.id, id)))
      .limit(1);
    return row ? toVehicle(row) : null;
  }

  async create(tenantId: string, input: CreateVehicleInput) {
    const [row] = await this.db
      .insert(vehicles)
      .values({
        tenantId,
        registrationNumber: input.registrationNumber.toUpperCase(),
        type: input.type ?? 'truck',
        ownerType: input.ownerType ?? 'owned',
        driverName: input.driverName,
        capacity:
          input.capacity !== undefined ? String(input.capacity) : undefined,
      })
      .returning();
    return toVehicle(row);
  }

  async update(tenantId: string, id: string, input: UpdateVehicleInput) {
    const data: Record<string, unknown> = {};
    if (input.registrationNumber !== undefined)
      data.registrationNumber = input.registrationNumber.toUpperCase();
    if (input.type !== undefined) data.type = input.type;
    if (input.ownerType !== undefined) data.ownerType = input.ownerType;
    if (input.driverName !== undefined) data.driverName = input.driverName;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.capacity !== undefined)
      data.capacity = input.capacity === null ? null : String(input.capacity);

    const [row] = await this.db
      .update(vehicles)
      .set(data)
      .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.id, id)))
      .returning();
    return row ? toVehicle(row) : null;
  }

  async softDelete(tenantId: string, id: string) {
    const result = await this.db
      .update(vehicles)
      .set({ isActive: false })
      .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.id, id)))
      .returning({ id: vehicles.id });
    return result.length > 0;
  }
}

export const vehicleRepositoryProvider = {
  provide: VEHICLE_REPOSITORY,
  useClass: DrizzleVehicleRepository,
};
