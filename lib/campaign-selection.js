export function toggleVisibleCampaignSelection(selectedIds, visibleIds, checked) {
  const next = new Set(selectedIds);
  for (const id of visibleIds) {
    if (checked) next.add(id);
    else next.delete(id);
  }
  return [...next];
}

export async function deleteCampaignsInBatches(campaigns, deleteCampaign, concurrency = 3) {
  const deletedIds = [];
  const failed = [];
  for (let index = 0; index < campaigns.length; index += concurrency) {
    const batch = campaigns.slice(index, index + concurrency);
    const results = await Promise.allSettled(batch.map(campaign => deleteCampaign(campaign)));
    results.forEach((result, resultIndex) => {
      const campaign = batch[resultIndex];
      if (result.status === "fulfilled") deletedIds.push(campaign.id);
      else failed.push({ id: campaign.id, name: campaign.name, error: result.reason });
    });
  }
  return { deletedIds, failed };
}
