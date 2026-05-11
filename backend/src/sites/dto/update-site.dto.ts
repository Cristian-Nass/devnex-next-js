import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

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
}
