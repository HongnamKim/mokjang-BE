import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupsService } from '../service/groups.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { QueryRunner as QR } from 'typeorm';
import { TransactionInterceptor } from '../../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../../common/decorator/query-runner.decorator';

@ApiTags('Management:Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({
    summary: '교회의 그룹 조회',
    description: '<h2>교회 내의 그룹을 조회합니다.</h2>',
  })
  @Get()
  getGroups(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.groupsService.getGroups(churchId);
  }

  @ApiOperation({
    summary: '교회 그룹 생성',
    description:
      '<h2>교회 내의 그룹을 생성합니다.</h2>' +
      '<p>그룹 이름에는 특수문자 및 띄어쓰기를 사용할 수 없습니다.</p>' +
      '<p>띄어쓰기가 포함된 경우 이를 제거하고 이름으로 지정합니다.</p>',
  })
  @Post()
  @UseInterceptors(TransactionInterceptor)
  postGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Body() dto: CreateGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.createGroup(churchId, dto, qr);
  }

  @ApiOperation({
    summary: '특정 그룹 조회',
    description:
      '<h2>교회 내의 특정 그룹을 조회합니다.</h2>' +
      '<p>포함된 내용</p>' +
      '<p>1. 그룹 내 역할 (groupRoles) - deprecated</p>' +
      '<p>2. 자식 그룹의 id (childGroupIds)</p>' +
      '<p>3. 부모 그룹의 id, 이름, depth (parentGroups)</p>',
  })
  @Get(':groupId')
  getGroupById(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsService.getGroupByIdWithParents(churchId, groupId);
  }

  @ApiOperation({
    summary: '그룹 수정',
    description:
      '<h2>교회 내의 그룹을 수정합니다.</h2>' +
      '<p>수정 가능 요소</p>' +
      '<p>1. 그룹 이름 (중복 불가)</p>' +
      '<p>2. 상위 그룹</p>' +
      '<p>상위 그룹을 없애려는 경우 ministryGroupId 를 null 로 설정</p>',
  })
  @Patch(':groupId')
  @UseInterceptors(TransactionInterceptor)
  patchGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: UpdateGroupDto,
    @QueryRunner() qr: QR,
  ) {
    return this.groupsService.updateGroup(churchId, groupId, dto, qr);
  }

  @ApiOperation({
    summary: '그룹 삭제',
    description:
      '<h2>교회 내의 그룹을 삭제합니다.</h2>' +
      '<p>하위 그룹 또는 소속 그룹원이 있는 경우 삭제가 불가능합니다. (BadRequestException)</p>',
  })
  @Delete(':groupId')
  @UseInterceptors(TransactionInterceptor)
  deleteGroup(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @QueryRunner() qr: QR,
    //@Query('cascade', ParseBoolPipe) cascade: boolean = false,
  ) {
    return this.groupsService.deleteGroup(churchId, groupId, qr /*cascade*/);
  }

  @ApiOperation({
    summary: '하위 그룹 id 조회',
    description: '<h2>해당 그룹의 하위 그룹들의 id 값을 조회합니다.</h2>',
  })
  @Get(':groupId/childGroups')
  getGroupsCascade(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsService.getGroupsCascade(churchId, groupId);
  }

  /*@Get(':groupId/role')
  getGroupRoles(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupsService.getGroupRoles(churchId, groupId);
  }

  @Post(':groupId/role')
  postGroupRole(
    @Param('churchId', ParseIntPipe) churchId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateGroupRoleDto,
  ) {
    return this.groupsService.createGroupRole(churchId, groupId, dto);
  }

  @Patch(':groupId/role/:roleId')
  patchGroupRole(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: UpdateGroupRoleDto,
  ) {
    return this.groupsService.updateGroupRole(groupId, roleId, dto);
  }

  @Delete(':groupId/role/:roleId')
  deleteGroupRole(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.groupsService.deleteGroupRole(groupId, roleId);
  }*/
}
