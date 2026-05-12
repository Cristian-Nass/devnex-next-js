import { IsBoolean, IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSiteDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsIn(['SUBDOMAIN', 'CUSTOM_DOMAIN'])
  provisioningType?: 'SUBDOMAIN' | 'CUSTOM_DOMAIN';

  @IsOptional()
  @IsString()
  @MaxLength(120)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  gtmContainerId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(253)
  customDomain?: string;
}
