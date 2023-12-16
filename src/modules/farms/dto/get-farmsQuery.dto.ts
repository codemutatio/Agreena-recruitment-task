import { Transform } from "class-transformer";
import { IsOptional, Max, Min, IsNumber, IsNotEmpty, IsEnum } from "class-validator";

export enum SortBy {
  NAME = "name",
  DATE = "date",
  DISTANCE = "distance",
}

export enum FilterBy {
  OUTLIERS = "OUTLIERS",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export const defaultSortOrder = {
  [SortBy.NAME]: SortOrder.ASC,
  [SortBy.DATE]: SortOrder.DESC,
  [SortBy.DISTANCE]: SortOrder.ASC,
};

/**
 * @openapi
 * components:
 *  schemas:
 *    GetFarmsQueryDto:
 *      type: object
 *      properties:
 *        filterBy:
 *          type: string
 *          enum: [OUTLIERS]
 *          description: "Filter farms by certain criteria"
 *          example: OUTLIERS
 *        filterValue:
 *          type: string
 *          enum: [true, false]
 *          description: "Value for the filter, e.g., 'true' for including outliers"
 *          example: true
 *        page:
 *          type: number
 *          description: "Page number for pagination"
 *          minimum: 1
 *          default: 1
 *        size:
 *          type: number
 *          description: "Number of farms to return per page"
 *          minimum: 0
 *          maximum: 100
 *          default: 100
 *        sortBy:
 *          type: string
 *          enum: [name, date, distance]
 *          description: "Sort farms by name, date, or distance"
 *          default: name
 *        sortOrder:
 *          type: string
 *          enum: [ASC, DESC]
 *          description: "Order of sorting, ascending or descending"
 *          default: ASC
 */
export class GetFarmsQueryDto {
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(FilterBy)
  public filterBy?: FilterBy;

  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => (value as string) === "true")
  public filterValue?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value as string, 10))
  public page: number = 1;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseInt(value as string, 10))
  public size: number = 100;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(SortBy)
  public sortBy: SortBy = SortBy.NAME;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(SortOrder)
  public sortOrder: SortOrder = defaultSortOrder[this.sortBy];
}
