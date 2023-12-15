import { Transform } from "class-transformer";
import { IsOptional, Max, Min, IsNumber, IsNotEmpty, IsUUID, IsEnum } from "class-validator";

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
 *      required:
 *        - userId
 *      properties:
 *        filterBy:
 *          type: string
 *          enum: [OUTLIERS]
 *          description: "Filter farms by certain criteria"
 *        filterValue:
 *          type: string
 *          enum: [true, false]
 *          description: "Value for the filter, e.g., 'true' for including outliers"
 *        page:
 *          type: number
 *          description: "Page number for pagination"
 *        size:
 *          type: number
 *          description: "Number of farms to return per page"
 *          minimum: 0
 *          maximum: 100
 *        sortBy:
 *          type: string
 *          enum: [name, date, distance]
 *          description: "Sort farms by name, date, or distance"
 *        sortOrder:
 *          type: string
 *          enum: [ASC, DESC]
 *          description: "Order of sorting, ascending or descending"
 *        userId:
 *          type: string
 *          format: uuid
 *          description: "User ID for user-specific queries"
 */
export class GetFarmsQueryDto {
  @IsOptional()
  @IsEnum(FilterBy)
  public filterBy?: FilterBy;

  @IsOptional()
  @Transform(({ value }) => (value as string) === "true")
  public filterValue?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value as string, 10))
  public page: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseInt(value as string, 10))
  public size: number = 100;

  @IsOptional()
  @IsEnum(SortBy)
  public sortBy: SortBy = SortBy.NAME;

  @IsOptional()
  @IsEnum(SortOrder)
  public sortOrder: SortOrder = defaultSortOrder[this.sortBy];

  @IsNotEmpty()
  @IsUUID()
  public userId: string;
}
