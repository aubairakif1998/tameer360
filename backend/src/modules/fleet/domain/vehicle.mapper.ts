import type { VehicleRecord } from '../../../shared/database/schema/vehicles';
import type { Vehicle } from './vehicle.entity';

export function toVehicle(record: VehicleRecord): Vehicle {
  return {
    id: record.id,
    tenantId: record.tenantId,
    registrationNumber: record.registrationNumber,
    type: record.type,
    ownerType: record.ownerType,
    driverName: record.driverName,
    capacity: record.capacity,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
