import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsIn(['SUBDOMAIN', 'CUSTOM_DOMAIN'])
  provisioningType: 'SUBDOMAIN' | 'CUSTOM_DOMAIN';

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

  @ValidateIf((o: CreateSiteDto) => o.provisioningType === 'CUSTOM_DOMAIN')
  @IsString()
  @IsNotEmpty()
  @MaxLength(253)
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i, {
    message: 'Enter a valid domain (e.g. www.example.com)',
  })
  customDomain?: string;
}
