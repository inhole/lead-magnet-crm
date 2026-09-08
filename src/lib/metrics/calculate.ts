export type MetricVisit = { visitorId: string; channel: string }
export type MetricSubmission = { visitorId: string; channel: string }

export function calculateMetric(visits: MetricVisit[], submissions: MetricSubmission[]) {
  const visitors = new Set(visits.map((visit) => visit.visitorId)).size
  const convertedVisitors = new Set(submissions.map((submission) => submission.visitorId)).size
  return {
    visits: visits.length,
    visitors,
    submissions: submissions.length,
    convertedVisitors,
    conversionRate: visitors ? Math.round((convertedVisitors / visitors) * 10000) / 100 : 0,
  }
}
