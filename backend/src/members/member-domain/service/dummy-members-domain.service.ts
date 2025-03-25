import { IDummyMembersDomainService } from './interface/dummy-members-domain.service.interface';
import { CreateMemberDto } from '../../dto/create-member.dto';
import { MemberModel } from '../../entity/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';

export class DummyMembersDomainService implements IDummyMembersDomainService {
  constructor(
    @InjectRepository(MemberModel)
    private readonly membersRepository: Repository<MemberModel>,
  ) {}

  private getMembersRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(MemberModel) : this.membersRepository;
  }

  createDummyMemberModel(
    dto: CreateMemberDto & { churchId: number },
  ): MemberModel {
    const membersRepository = this.getMembersRepository();

    return membersRepository.create(dto);
  }

  createDummyMembers(members: MemberModel[], qr?: QueryRunner) {
    const membersRepository = this.getMembersRepository(qr);

    return membersRepository.save(members);
  }
}
