export enum NotificationEvent {
  TASK_IN_CHARGE_ADDED = 'task.inCharge.added',
  TASK_IN_CHARGE_CHANGED = 'task.inCharge.changed',
  TASK_IN_CHARGE_REMOVED = 'task.inCharge.removed',
  TASK_REPORT_ADDED = 'task.report.added',
  TASK_REPORT_REMOVED = 'task.report.removed',
  TASK_STATUS_UPDATED = 'task.status.updated',
  TASK_META_UPDATED = 'task.meta.updated',
  TASK_DELETED = 'task.deleted',

  VISITATION_IN_CHARGE_ADDED = 'visitation.inCharge.added',
  VISITATION_REPORT_ADDED = 'visitation.report.added',
  VISITATION_REPORT_REMOVED = 'visitation.report.removed',
  VISITATION_DELETED = 'visitation.deleted',
}
