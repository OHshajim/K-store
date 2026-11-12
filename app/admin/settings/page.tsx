import { EmptyState } from "@astryxdesign/core/EmptyState";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getStoreSettings } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  if (!settings) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <EmptyState
          title="Settings missing"
          description="The store_settings row is missing. Re-run the seed SQL."
        />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <SettingsForm settings={settings} />
    </div>
  );
}
