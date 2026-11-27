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
  },

  /**
   * Tạo quy tắc giá mới cho sân của Chủ sân
   * POST /api/v1/owner/price-rules
   */
  createPriceRule: async ({
    courtId,
    name,
    specificDates,
    daysOfWeek,
    startTime,
    endTime,
    pricePerSlot,
    validFrom,
    validTo,
    priority,
    status
  }) => {
    const payload = {
      courtId,
      name: name?.trim(),
      specificDates: Array.isArray(specificDates) ? specificDates : [],
      daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek.map(Number) : [],
      startTime,
      endTime,
      pricePerSlot: Number(pricePerSlot),
      validFrom,
      validTo: validTo && validTo.trim() ? validTo.trim() : null,
      priority: Number(priority) || 1,
      status: status || 'ACTIVE'
    };

    const endpoint = courtId
      ? `/owner/courts/${encodeURIComponent(courtId)}/price-rules`
      : '/owner/price-rules';

    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return normalizePriceRule(response?.data);
  }
};
