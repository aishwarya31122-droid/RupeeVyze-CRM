const getAdvisorCode = (candidate, record) => {
  if (record?.advisorCode) return record.advisorCode;
  if (candidate?.advisorCode) return candidate.advisorCode;
  return `ADV-${String(candidate?.id || 0).padStart(3, "0")}`;
};

const getFallbackPaymentDate = (month, index) => {
  if (!month) {
    const now = new Date();
    const fallbackMonth = (now.getMonth() + (index % 12)) % 12;
    const fallbackYear = now.getFullYear() + Math.floor((now.getMonth() + (index % 12)) / 12);
    return `${fallbackYear}-${String(fallbackMonth + 1).padStart(2, "0")}-15`;
  }
  const [year, monthValue] = month.split("-");
  const date = new Date(Number(year), Number(monthValue), 15);
  return date.toISOString().slice(0, 10);
};

const getFallbackRemarks = (advisorName, paymentStatus, index) => {
  const statusText = paymentStatus === "Paid" ? "Payment released" : "Payout scheduled";
  return `${statusText} for ${advisorName} and reconciled against premium collection ${index + 1}.`;
};

export function getActiveAdvisorRows(candidates = [], performanceRecords = []) {
  return (candidates || [])
    .filter((candidate) => {
      const isAdvisorRecord = candidate.leadType === "Advisor" || candidate.leadType === "Recruitment";
      const isActivated = candidate.workflowStage === "Activated" || candidate.workflowStage === "Activated Advisor";
      const hasActiveStatus = candidate.leadStatus === "Active" || candidate.leadStatus === "Active Advisor";
      return isAdvisorRecord && isActivated && hasActiveStatus;
    })
    .map((candidate) => {
      const record = (performanceRecords || []).find((item) => {
        const sameAdvisorCode = Boolean(item.advisorCode) && item.advisorCode === candidate.advisorCode;
        const sameAdvisorName = Boolean(item.advisorName) && item.advisorName === candidate.name;
        return sameAdvisorCode || sameAdvisorName;
      });

      const premiumCollected = Number(record?.premiumCollected || 0);
      const policiesSold = Number(record?.policiesSold || 0);
      const persistency = Number(record?.persistency || 0);
      const monthlyTarget = Number(record?.monthlyTarget || 0);
      const achievement = monthlyTarget ? (premiumCollected / monthlyTarget) * 100 : 0;
      const advisorCode = getAdvisorCode(candidate, record);

      return {
        ...candidate,
        advisorCode,
        premiumCollected,
        policiesSold,
        persistency,
        monthlyTarget,
        achievement,
        businessStatus: achievement >= 100 ? "Healthy" : achievement >= 70 ? "On Track" : "Watchlist",
        performance: record || null
      };
    });
}

export function getPerformanceSummary(activeAdvisors = []) {
  const totalPolicies = activeAdvisors.reduce((sum, advisor) => sum + Number(advisor.policiesSold || 0), 0);
  const totalPremium = activeAdvisors.reduce((sum, advisor) => sum + Number(advisor.premiumCollected || 0), 0);
  const averagePersistency = activeAdvisors.length
    ? activeAdvisors.reduce((sum, advisor) => sum + Number(advisor.persistency || 0), 0) / activeAdvisors.length
    : 0;
  const averageAchievement = activeAdvisors.length
    ? activeAdvisors.reduce((sum, advisor) => sum + Number(advisor.achievement || 0), 0) / activeAdvisors.length
    : 0;
  const totalTarget = activeAdvisors.reduce((sum, advisor) => sum + Number(advisor.monthlyTarget || 0), 0);
  const bestPerformer = [...activeAdvisors].reduce((best, advisor) => {
    const currentAchievement = Number(advisor.achievement || 0);
    return currentAchievement > (best?.achievement || 0) ? advisor : best;
  }, null);

  return {
    activeAdvisors: activeAdvisors.length,
    totalPolicies,
    totalPremium,
    averagePersistency,
    averageAchievement,
    bestPerformer,
    monthlyTargetAchievement: totalTarget ? (totalPremium / totalTarget) * 100 : 0
  };
}

export function getOverrideRecords(activeAdvisors = [], performanceRecords = [], existingOverrideRecords = []) {
  const activeCodes = new Set(activeAdvisors.map((advisor) => advisor.advisorCode));

  return (performanceRecords || [])
    .filter((record) => activeCodes.has(record.advisorCode) || activeAdvisors.some((advisor) => advisor.name === record.advisorName))
    .map((record, index) => {
      const existing = (existingOverrideRecords || []).find((item) => item.recordId === record.id);
      const overridePercent = existing?.overridePercent ?? 5;
      const premiumCollected = Number(record.premiumCollected || 0);

      const paymentStatus = existing?.paymentStatus ?? "Pending";
      const fallbackPaymentDate = getFallbackPaymentDate(record.month, index);
      const fallbackNotes = getFallbackRemarks(record.advisorName, paymentStatus, index);

      return {
        id: existing?.id || `PAY-${String(index + 1).padStart(3, "0")}`,
        recordId: record.id,
        advisorName: record.advisorName,
        advisorCode: record.advisorCode,
        month: record.month,
        premiumCollected,
        overridePercent,
        overrideEarned: premiumCollected * (overridePercent / 100),
        paymentStatus,
        paymentDate: existing?.paymentDate ?? fallbackPaymentDate,
        notes: existing?.notes ?? fallbackNotes
      };
    });
}
