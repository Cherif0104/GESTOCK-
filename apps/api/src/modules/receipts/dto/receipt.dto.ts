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

export class ReceiptLineDto {
  @ApiProperty() @IsString() productId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() purchaseOrderLineId?: string;
  @ApiProperty() @IsNumber() @Min(0.0001) quantity!: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) unitCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() batchNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() serialNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiryDate?: string;
}

export class CreateReceiptDto {
  @ApiProperty() @IsString() warehouseId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() purchaseOrderId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reference?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiProperty({ type: [ReceiptLineDto] })
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ReceiptLineDto)
  lines!: ReceiptLineDto[];
}
