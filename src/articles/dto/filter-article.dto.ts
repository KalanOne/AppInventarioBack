import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class FilterArticleDto {
  @IsOptional()
  @IsNumberString()
  skip: number;

  @IsOptional()
  @IsNumberString()
  limit: number;

  @IsOptional()
  @IsString()
  search: string;
}
