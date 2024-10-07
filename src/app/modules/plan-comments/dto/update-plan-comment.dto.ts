import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanCommentDto } from './create-plan-comment.dto';

export class UpdatePlanCommentDto extends PartialType(CreatePlanCommentDto) {}
