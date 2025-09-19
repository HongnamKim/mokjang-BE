export const BaseReportFindOptionsSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  reportedAt: true,
  isRead: true,
  isConfirmed: true,
};

export const BaseReportSummarizedSelectQB = [
  'report.id',
  'report.isRead',
  'report.isConfirmed',
  'report.reportedAt',
];
