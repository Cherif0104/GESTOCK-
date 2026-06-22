import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { StockMovementType } from '@gestock/shared';

export class TransferStockDto {
  @ApiProperty() @IsString() @IsNotEmpty() productId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() fromWarehouseId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() toWarehouseId!: string;
  @ApiProperty() @IsNumber() @Min(0.0001) quantity!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reference?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

export class AdjustStockDto {
  @ApiProperty() @IsString() productId!: string;
  @ApiProperty() @IsString() warehouseId!: string;
  @ApiProperty({ description: 'Quantité signée (+/-)' }) @IsNumber() quantity!: number;
  @ApiProperty() @IsString() reason!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reference?: string;
}

export class StockMovementFilterDto {
  @ApiPropertyOptional() @IsOptional() @IsString() productId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() warehouseId?: string;
  @ApiPropertyOptional({ enum: StockMovementType })
  @IsOptional() @IsIn(Object.values(StockMovementType))
  type?: StockMovementType;
}
