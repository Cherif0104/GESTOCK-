import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty() @IsString() siteId!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiPropertyOptional({ enum: ['STANDARD', 'COLD', 'QUARANTINE', 'VIRTUAL'] })
  @IsOptional() @IsIn(['STANDARD', 'COLD', 'QUARANTINE', 'VIRTUAL'])
  type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() manager?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
