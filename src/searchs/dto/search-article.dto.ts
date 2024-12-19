import { IsOptional, IsString, IsNumber } from 'class-validator';
import { NumberTransform } from 'src/utils/decorators/transforms';

export class SearchArticleDto {
  @IsOptional()
  @IsNumber()
  @NumberTransform()
  id: number;

  @IsOptional()
  @IsString()
  barcode: string;

  @IsOptional()
  @IsString()
  multiple: string;

  @IsOptional()
  @IsNumber()
  @NumberTransform()
  factor: number;
}
