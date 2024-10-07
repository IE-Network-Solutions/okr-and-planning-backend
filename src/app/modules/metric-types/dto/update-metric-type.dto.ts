import { PartialType } from '@nestjs/mapped-types';
import { CreateMetricTypeDto } from './create-metric-type.dto';

export class UpdateMetricTypeDto extends PartialType(CreateMetricTypeDto) {}
