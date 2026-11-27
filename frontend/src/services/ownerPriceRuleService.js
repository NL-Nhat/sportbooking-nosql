import { apiRequest } from './apiClient.js';

function normalizePriceRule(rule) {
  if (!rule) return null;
  const resolvedId = rule.id || rule._id;
  return {
    ...rule,
    id: resolvedId,
    _id: resolvedId,
    pricePerSlot: Number(rule.pricePerSlot) || 0,
    priority: Number(rule.priority) || 1,
    daysOfWeek: Array.isArray(rule.daysOfWeek) ? rule.daysOfWeek : [],
    specificDates: Array.isArray(rule.specificDates) ? rule.specificDates : []
  };
}

export const ownerPriceRuleService = {
  /**
   * Lấy danh sách quy tắc giá theo sân của Chủ sân
   * GET /api/v1/owner/price-rules?courtId=...&status=...
   */
  getPriceRules: async ({ courtId = '', status = '' } = {}) => {
    const params = new URLSearchParams();
    if (courtId && courtId.trim()) {
      params.set('courtId', courtId.trim());
    }
    if (status && status.trim()) {
      params.set('status', status.trim());
    }
    const queryString = params.toString();
    const endpoint = queryString ? `/owner/price-rules?${queryString}` : '/owner/price-rules';

    const response = await apiRequest(endpoint, {
      method: 'GET'
    });
    const list = Array.isArray(response?.data) ? response.data : [];
    return list.map(normalizePriceRule);
  }
};
