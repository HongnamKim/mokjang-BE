import { NotificationDomain } from './const/notification-domain.enum';
import { NotificationAction } from './const/notification-action.enum';
import { ChurchUserModel } from '../church-user/entity/church-user.entity';

export enum NotificationField {
  STATUS = 'status',
  IN_CHARGE = 'inCharge',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  TITLE = 'title',
}

export class NotificationFields {
  fields: NotificationField | string;
  previous: any;
  current: any;

  constructor(fields: NotificationField | string, previous: any, current: any) {
    this.fields = fields;
    this.previous = previous;
    this.current = current;
  }
}

export abstract class NotificationSource {
  id: number;
  domain: NotificationDomain;

  protected constructor(domain: NotificationDomain, id: number) {
    this.id = id;
    this.domain = domain;
  }
}
export class NotificationSourceChurch extends NotificationSource {
  constructor(domain: NotificationDomain, id: number) {
    super(domain, id);
  }
}

export class NotificationSourceWorship extends NotificationSource {
  constructor(domain: NotificationDomain, id: number) {
    super(domain, id);
  }
}

export class NotificationSourceManager extends NotificationSource {
  constructor(domain: NotificationDomain, id: number) {
    super(domain, id);
  }
}

export class NotificationSourcePermissionTemplate extends NotificationSource {
  constructor(domain: NotificationDomain, id: number) {
    super(domain, id);
  }
}

export class NotificationSourceTask extends NotificationSource {
  constructor(domain: NotificationDomain, id: number) {
    super(domain, id);
  }
}

export class NotificationSourceVisitation extends NotificationSource {
  constructor(domain: NotificationDomain, id: number) {
    super(domain, id);
  }
}

export class NotificationSourceEducationSession extends NotificationSource {
  constructor(
    domain: NotificationDomain,
    public readonly educationId: number,
    public readonly educationTermId: number,
    id: number,
  ) {
    super(domain, id);
  }
}

export class NotificationSourceEducationTerm extends NotificationSource {
  constructor(
    domain: NotificationDomain,
    public readonly educationId: number,
    id: number,
  ) {
    super(domain, id);
  }
}

export class NotificationEventDto {
  actorName: string;

  domain: NotificationDomain;

  action: NotificationAction;

  title: string;

  source: NotificationSource | null;

  notificationReceivers: ChurchUserModel[];

  fields: NotificationFields[];

  constructor(
    actorName: string,
    domain: NotificationDomain,
    action: NotificationAction,
    title: string,
    source: NotificationSource | null,
    notificationReceivers: ChurchUserModel[],
    fields: NotificationFields[],
  ) {
    this.actorName = actorName;
    this.domain = domain;
    this.action = action;
    this.title = title;
    this.source = source;
    this.notificationReceivers = notificationReceivers;
    this.fields = fields;
  }
}
