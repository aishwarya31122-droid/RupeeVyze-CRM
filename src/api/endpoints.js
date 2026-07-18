import { api } from "./apiClient.js";

export const candidatesApi = {
  list: (params) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get("/candidates" + qs);
  },
  getById: (id) => api.get("/candidates/" + id),
  create: (data) => api.post("/candidates", data),
  update: (id, data) => api.put("/candidates/" + id, data),
  remove: (id) => api.delete("/candidates/" + id),
  updateStage: (id, stage) => api.patch("/candidates/" + id + "/stage", { stage }),
  updateNote: (id, note) => api.patch("/candidates/" + id + "/note", { note }),
  updateFollowUp: (id, data) => api.patch("/candidates/" + id + "/follow-up", data),
  addTask: (id, task) => api.patch("/candidates/" + id + "/tasks", task),
  exportCsv: () => api.get("/candidates/export/csv"),
  bulkCreate: (records) => api.post("/candidates/bulk", { records })
};

export const clientsApi = {
  list: (params) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get("/clients" + qs);
  },
  getById: (id) => api.get("/clients/" + id),
  create: (data) => api.post("/clients", data),
  update: (id, data) => api.put("/clients/" + id, data),
  getPolicies: (params) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get("/clients/policies" + qs);
  },
  getClaims: (params) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get("/clients/claims" + qs);
  },
  getRenewals: (params) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get("/clients/renewals" + qs);
  }
};

export const teamMembersApi = {
  list: () => api.get("/team-members")
};

export const settingsApi = {
  get: () => api.get("/settings"),
  update: (data) => api.put("/settings", data)
};

export const performanceApi = {
  list: () => api.get("/performance-records"),
  create: (data) => api.post("/performance-records", data),
  update: (id, data) => api.put("/performance-records/" + id, data)
};

export const overridePayoutsApi = {
  list: () => api.get("/override-payout-records"),
  replaceAll: (data) => api.put("/override-payout-records", data)
};

export const servicesApi = {
  list: (params) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return api.get("/services" + qs);
  },
  create: (data) => api.post("/services", data),
  update: (id, data) => api.put("/services/" + id, data),
  remove: (id) => api.delete("/services/" + id)
};
