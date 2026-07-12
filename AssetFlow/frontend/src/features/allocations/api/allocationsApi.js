import apiClient from '../../../services/apiClient';

export const getAssetAllocation = async (assetId) => {
  try {
    const [assetRes, allocRes] = await Promise.all([
      apiClient.get(`/assets/${assetId}`),
      apiClient.get('/allocations', { params: { asset_id: assetId, status: 'active' } }),
    ]);
    const asset = assetRes.data?.data || assetRes.data || {};
    const allocs = allocRes.data?.data?.allocations || allocRes.data?.allocations || [];
    const activeAlloc = allocs.length > 0 ? allocs[0] : null;

    return {
      data: {
        assetId: asset.id || assetId,
        assetTag: asset.asset_tag || asset.tag || '',
        assetName: asset.name || '',
        currentHolder: activeAlloc ? {
          name: activeAlloc.employee_name || activeAlloc.user_name || 'Assigned Employee',
          department: activeAlloc.department_name || 'Assigned Department',
        } : null,
      },
    };
  } catch (error) {
    throw new Error(error?.response?.data?.error?.message || error?.message || 'Could not load asset allocation details.');
  }
};

export const getAllocationHistory = async (assetId) => {
  try {
    const res = await apiClient.get(`/assets/${assetId}/history`);
    const payload = res.data?.data || res.data || {};
    const allocs = payload.allocations || [];
    const items = allocs.map((h) => ({
      id: h.id,
      date: h.allocated_date || h.created_at,
      description: `Allocated to ${h.employee_name || 'Employee'}${h.returned_date ? ` (Returned on ${new Date(h.returned_date).toLocaleDateString()})` : ''}`,
    }));
    return { data: items };
  } catch (error) {
    throw new Error(error?.response?.data?.error?.message || error?.message || 'Could not load allocation history.');
  }
};

export const requestTransfer = async (assetId, payload) => {
  try {
    const allocRes = await apiClient.get('/allocations', { params: { asset_id: assetId, status: 'active' } });
    const allocs = allocRes.data?.data?.allocations || allocRes.data?.allocations || [];
    const activeAlloc = allocs[0];
    if (!activeAlloc) {
      throw new Error('No active allocation found for this asset.');
    }

    const res = await apiClient.post('/transfer-requests', {
      asset_id: assetId,
      from_allocation_id: activeAlloc.id,
      requested_to_employee_id: payload.toEmployeeId,
      reason: payload.reason,
    });
    return { data: res.data?.data || res.data };
  } catch (error) {
    throw new Error(error?.response?.data?.error?.message || error?.message || 'Could not submit transfer request.');
  }
};

export const getEmployees = async () => {
  try {
    const res = await apiClient.get('/auth/users');
    const users = res.data?.data || res.data || [];
    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.name || u.email,
      })),
    };
  } catch (error) {
    return { data: [] };
  }
};

export const searchAssets = async (query) => {
  try {
    const res = await apiClient.get('/assets', { params: { tag: query } });
    const assets = res.data?.data?.assets || res.data?.assets || [];
    const formatted = assets.map((a) => ({
      id: a.id,
      tag: a.asset_tag,
      name: a.name,
      status: a.status,
    }));
    return { data: formatted };
  } catch (error) {
    throw new Error(error?.response?.data?.error?.message || error?.message || 'Search failed.');
  }
};