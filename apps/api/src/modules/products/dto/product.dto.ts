import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty() @IsString() sku!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() unitId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() barcode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isStockable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isSellable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPurchasable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) costPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) sellingPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) minStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) maxStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) reorderPoint?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) leadTimeDays?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() trackBatch?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() trackSerial?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() trackExpiry?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) shelfLifeDays?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() weightKg?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() volumeM3?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
