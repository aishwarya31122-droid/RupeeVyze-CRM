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
  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex < 0) return stages;
  return stages.slice(currentIndex);
}

export function getStageConversion(stageCounts) {
  const total = stageCounts.reduce((sum, item) => sum + item.count, 0);
  return {
    overall: total ? Math.round(((stageCounts.find((item) => item.stage === "Activated")?.count || 0) / total) * 100) : 0,
    byStage: stageCounts.map((item) => ({
      stage: item.stage,
      rate: total ? Math.round((item.count / total) * 100) : 0
    }))
  };
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
