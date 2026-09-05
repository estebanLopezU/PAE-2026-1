import api from "./api";

export const aiApi = {
  analyzeSector: (sectorId) => api.post("/ai/analyze/sector", { sector_id: sectorId || null }),
  analyzeEntity: (entityId) => api.post("/ai/analyze/entity", { entity_id: entityId }),
  getClusterInsights: (sectorId) => api.get("/ai/clusters" + (sectorId ? "?sector_id=" + sectorId : "")),
  trainModels: (forceRetrain) => api.post("/ai/train", { force_retrain: forceRetrain })
};
