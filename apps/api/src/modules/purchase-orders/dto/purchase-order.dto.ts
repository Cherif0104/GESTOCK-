import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PurchaseOrderLineDto {
  @ApiProperty() @IsString() productId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() @Min(0.0001) quantity!: number;
  @ApiProperty() @IsNumber() @Min(0) unitPrice!: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) taxRate?: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty() @IsString() supplierId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reference?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expectedDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiProperty({ type: [PurchaseOrderLineDto] })
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => PurchaseOrderLineDto)
  lines!: PurchaseOrderLineDto[];
}

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expectedDate?: string;
  @ApiPropertyOptional({ type: [PurchaseOrderLineDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PurchaseOrderLineDto)
  lines?: PurchaseOrderLineDto[];
}
