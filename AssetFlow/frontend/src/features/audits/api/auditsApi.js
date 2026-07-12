import apiClient from '../../../services/apiClient';

export const getActiveAuditCycle = async () => {
  try {
    const res = await apiClient.get('/audits/active');
    const cycle = res.data?.data || res.data || null;
    if (!cycle || !cycle.id) {
      return { data: null };
    }

    // Format auditors and items for UI
    const startDate = cycle.start_date ? new Date(cycle.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    const endDate = cycle.end_date ? new Date(cycle.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    return {
      data: {
        id: cycle.id,
        name: cycle.name || 'Audit Cycle',
        scope: cycle.scope_department_name || cycle.scope_location || 'Organization-wide',
        dateRange: `${startDate} — ${endDate}`,
        auditors: cycle.auditor_names || cycle.auditors || [],
        status: cycle.status,
        items: (cycle.items || []).map((item) => ({
          itemId: item.id,
          assetId: item.asset_id || item.assetId,
          assetTag: item.asset_tag || item.assetTag || '',
          assetName: item.asset_name || item.assetName || '',
          expectedLocation: item.expected_location || item.location || 'Assigned Location',
          verification: item.result || item.verification || 'pending',
        })),
      },
    };
  } catch (error) {
    throw new Error(error?.response?.data?.error?.message || error?.message || 'Could not load active audit cycle.');
  }
};

export const verifyAuditItem = async (auditId, assetId, verification) => {
  try {
    const res = await apiClient.patch(`/audits/${auditId}/items/${assetId}`, { verification });
    return { data: res.data?.data || res.data };
  } catch (error) {
    throw new Error(error?.response?.data?.error?.message || error?.message || 'Could not update verification status.');
  }
};

export const closeAuditCycle = async (auditId) => {
  try {
    const res = await apiClient.post(`/audits/${auditId}/close`);
    return { data: res.data?.data || res.data };
  } catch (error) {
    throw new Error(error?.response?.data?.error?.message || error?.message || 'Could not close the audit cycle.');
  }
};