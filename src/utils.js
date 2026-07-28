const priorityOrder = ["High", "Medium", "Low"];

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function getStartOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isDueToday(dueDate) {
  if (!dueDate) return false;
  return isToday(dueDate);
}

export function isOverdueDueDate(dueDate) {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  return due < getStartOfToday();
}

export function isDueWithinDays(dueDate, days) {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const startOfToday = getStartOfToday();
  const endOfRange = new Date(startOfToday);
  endOfRange.setDate(endOfRange.getDate() + days);
  return due >= startOfToday && due <= endOfRange;
}

export function isNotConvertedOrLost(lead) {
  return lead.leadStatus !== "Converted" && lead.leadStatus !== "Lost";
}

export function getFollowUpDate(candidate) {
  return candidate.followUpDate || candidate.nextFollowUp || "";
}

export function getTodayFollowUps(candidates) {
  return candidates.filter((candidate) => {
    const followUpDate = getFollowUpDate(candidate);
    return followUpDate && isToday(followUpDate);
  });
}

export function getOverdueFollowUps(candidates) {
  return candidates.filter((candidate) => {
    const followUpDate = getFollowUpDate(candidate);
    if (!followUpDate) return false;
    const due = new Date(followUpDate);
    const today = new Date();
    return due < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
}

export function getUpcomingFollowUps(candidates) {
  return candidates.filter((candidate) => {
    const followUpDate = getFollowUpDate(candidate);
    if (!followUpDate) return false;
    const due = new Date(followUpDate);
    const today = new Date();
    return due > new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
}

export function sortByPriority(items) {
  return [...items].sort((a, b) => priorityOrder.indexOf(a.priority || a.followUp?.priority || "Medium") - priorityOrder.indexOf(b.priority || b.followUp?.priority || "Medium"));
}

export function getAllowedStageOptions(stages, currentStage) {
  if (!currentStage || !stages || stages.length === 0) return stages || [];
  const idx = stages.indexOf(currentStage);
  if (idx === -1) return [currentStage, ...stages];
  return stages;
}

export function getStageConversion(stageCounts) {
  const total = stageCounts.reduce((sum, item) => sum + item.count, 0);
  return {
    overall: total ? Math.round(((stageCounts.find((item) => item.stage === "Activation")?.count || 0) / total) * 100) : 0,
    byStage: stageCounts.map((item) => ({
      stage: item.stage,
      rate: total ? Math.round((item.count / total) * 100) : 0
    }))
  };
}

export function getRecordType(candidate) {
  if (!candidate) return "insurance_customer_lead";
  if (candidate.leadType === "Advisor" || candidate.leadType === "Recruitment") return "advisor";
  if (candidate.workflowStage === "Active Client") return "client";
  return "insurance_customer_lead";
}

export function isEligibleForSignIn(candidate) {
  if (!candidate) return false;
  if (candidate.leadType !== "Advisor" && candidate.leadType !== "Recruitment") return false;
  if (candidate.workflowStage !== "Activation" && candidate.workflowStage !== "Business Started") return false;
  return true;
}

export function getDropOffAnalysis(stageCounts) {
  return stageCounts.map((item, index) => {
    const nextCount = stageCounts[index + 1]?.count || 0;
    return {
      stage: item.stage,
      dropOff: item.count ? Math.round(((item.count - nextCount) / item.count) * 100) : 0
    };
  });
}
