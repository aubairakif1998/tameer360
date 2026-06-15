export type VehicleType = 'truck' | 'loader' | 'tractor' | 'dumper';
export type VehicleOwnerType = 'owned' | 'rented';

export interface Vehicle {
  id: string;
  tenantId: string;
  registrationNumber: string;
  type: VehicleType;
  ownerType: VehicleOwnerType;
  driverName: string | null;
  capacity: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVehicleInput {
  registrationNumber: string;
  type?: VehicleType;
  ownerType?: VehicleOwnerType;
  driverName?: string;
  capacity?: number;
}

export interface UpdateVehicleInput {
  registrationNumber?: string;
  type?: VehicleType;
  ownerType?: VehicleOwnerType;
  driverName?: string;
  capacity?: number | null;
  isActive?: boolean;
}

export interface ListVehiclesQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export const VEHICLE_REPOSITORY = Symbol('VEHICLE_REPOSITORY');

export interface VehicleRepository {
  findMany(
    tenantId: string,
    query: ListVehiclesQuery,
  ): Promise<{ items: Vehicle[]; total: number }>;
  findById(tenantId: string, id: string): Promise<Vehicle | null>;
  create(tenantId: string, input: CreateVehicleInput): Promise<Vehicle>;
  update(
    tenantId: string,
    id: string,
    input: UpdateVehicleInput,
  ): Promise<Vehicle | null>;
  softDelete(tenantId: string, id: string): Promise<boolean>;
}
