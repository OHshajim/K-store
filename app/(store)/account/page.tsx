import { redirect } from "next/navigation";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/data/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function AccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/account");

  return (
    <VStack gap={4} maxWidth={560}>
      <VStack gap={1}>
        <Text type="display-2" as="h1">
          Account
        </Text>
        <Text type="body" color="secondary">
          Manage your profile and orders.
        </Text>
      </VStack>
      <Card padding={5}>
        <VStack gap={4}>
          <MetadataList>
            <MetadataListItem label="Name">
              {profile.full_name || "—"}
            </MetadataListItem>
            <MetadataListItem label="Email">{profile.email}</MetadataListItem>
            <MetadataListItem label="Role">{profile.role}</MetadataListItem>
          </MetadataList>
          <HStack gap={2} wrap="wrap">
            <Link href="/orders">
              <Button label="View orders" variant="primary" />
            </Link>
            {profile.role === "admin" && (
              <Link href="/admin">
                <Button label="Vendor admin" variant="secondary" />
              </Link>
            )}
            <LogoutButton />
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
}
