import { Module } from '@nestjs/common';
import { vehicleRepositoryProvider } from './infrastructure/drizzle-vehicle.repository';
import {
  CreateVehicleUseCase,
  DeleteVehicleUseCase,
  GetVehicleUseCase,
  ListVehiclesUseCase,
  UpdateVehicleUseCase,
} from './application/vehicle.use-cases';
import { VehiclesController } from './presentation/vehicles.controller';

@Module({
  controllers: [VehiclesController],
  providers: [
    vehicleRepositoryProvider,
    ListVehiclesUseCase,
    GetVehicleUseCase,
    CreateVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
  ],
  exports: [vehicleRepositoryProvider],
})
export class FleetModule {}
