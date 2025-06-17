import { Controller, Get } from '@nestjs/common';
import { WorshipEnrollmentService } from '../service/worship-enrollment.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Worships:Enrollments')
@Controller(':worship/enrollments')
export class WorshipEnrollmentController {
  constructor(
    private readonly worshipEnrollmentService: WorshipEnrollmentService,
  ) {}

  @Get()
  getEnrollments() {}
}
