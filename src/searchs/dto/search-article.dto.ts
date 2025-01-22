import { IsOptional, IsString, IsNumber } from 'class-validator';
import {
  ArrayTransform,
  NumberTransform,
} from 'src/utils/decorators/transforms';

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

  @IsOptional()
  @ArrayTransform({ each: true, type: 'number' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { each: true },
  )
  product_id: number[];
}
