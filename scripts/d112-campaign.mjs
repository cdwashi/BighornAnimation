// WO-D112 selects the shared D111 campaign form with D112 artifact names.
process.env.BIGHORN_CAMPAIGN_ID = 'd112';
await import('./d111-campaign.mjs');
