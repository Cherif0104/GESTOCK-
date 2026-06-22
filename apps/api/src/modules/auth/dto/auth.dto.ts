import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@gestock.io' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Demo1234!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ required: false, description: 'Slug de l\'organisation (optionnel)' })
  @IsOptional()
  @IsString()
  organizationSlug?: string;
}

export class RegisterOrganizationDto {
  @ApiProperty({ example: 'Ma Société SARL' })
  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @ApiProperty({ example: 'ma-societe' })
  @IsString()
  @IsNotEmpty()
  organizationSlug!: string;

  @ApiProperty({ example: 'admin@masociete.io' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Demo1234!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Awa' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Koné' })
  @IsString()
  lastName!: string;

  @ApiProperty({ required: false, example: 'CI' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false, example: 'XOF' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
