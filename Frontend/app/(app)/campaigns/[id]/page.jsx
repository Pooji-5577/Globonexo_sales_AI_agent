export const metadata = {
  title: "Campaign Details — Globonexo Sales AI",
};

export default function CampaignDetailPage({ params }) {
  return (
    <div>
      <h1>Campaign {params.id}</h1>
      <p>TODO: build campaign detail/edit page, wire to /api/campaigns/:id</p>
    </div>
  );
}
