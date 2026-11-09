import { EmptyState } from "@astryxdesign/core/EmptyState";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getStoreSettings } from "@/lib/data/catalog";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  if (!settings) {
    return (
      <EmptyState
        title="Settings missing"
        description="The store_settings row is missing. Re-run the seed SQL."
      />
    );
  }

  return <SettingsForm settings={settings} />;
}
