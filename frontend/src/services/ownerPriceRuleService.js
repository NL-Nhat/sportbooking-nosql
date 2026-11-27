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
  },

  /**
   * Xem chi tiết một quy tắc giá
   * GET /api/v1/owner/price-rules/{id}
   */
  getPriceRuleById: async (ruleId) => {
    const response = await apiRequest(`/owner/price-rules/${encodeURIComponent(ruleId)}`, {
      method: 'GET'
    });
    return normalizePriceRule(response?.data);
  },

  /**
   * Cập nhật thông tin hoặc bật/tắt trạng thái quy tắc giá
   * PATCH /api/v1/owner/price-rules/{id}
   */
  updatePriceRule: async (ruleId, payload) => {
    const body = { ...payload };
    if (body.name !== undefined) {
      body.name = body.name.trim();
    }
    if (body.pricePerSlot !== undefined) {
      body.pricePerSlot = Number(body.pricePerSlot);
    }
    if (body.priority !== undefined) {
      body.priority = Number(body.priority) || 1;
    }
    if (body.daysOfWeek !== undefined) {
      body.daysOfWeek = Array.isArray(body.daysOfWeek) ? body.daysOfWeek.map(Number) : [];
    }
    if (body.specificDates !== undefined) {
      body.specificDates = Array.isArray(body.specificDates) ? body.specificDates : [];
    }
    if (body.validTo !== undefined) {
      body.validTo = body.validTo && body.validTo.trim() ? body.validTo.trim() : null;
    }

    const response = await apiRequest(`/owner/price-rules/${encodeURIComponent(ruleId)}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
    return normalizePriceRule(response?.data);
  },

  /**
   * Đổi nhanh trạng thái ACTIVE / INACTIVE của quy tắc giá
   * PATCH /api/v1/owner/price-rules/{id}
   */
  togglePriceRuleStatus: async (ruleId, status) => {
    const response = await apiRequest(`/owner/price-rules/${encodeURIComponent(ruleId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return normalizePriceRule(response?.data);
  },

  /**
   * Xóa quy tắc giá
   * DELETE /api/v1/owner/price-rules/{id}
   */
  deletePriceRule: async (ruleId) => {
    const response = await apiRequest(`/owner/price-rules/${encodeURIComponent(ruleId)}`, {
      method: 'DELETE'
    });
    return response;
  }
};
