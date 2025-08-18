import * as React from "react";
import EntityForm from "@/components/EntityForm";
import LayoutShell from "@/components/LayoutShell";

export default async function ViewEntityPage({
  params,
}: {
  params: Promise<{ listField: string; id: string }>;
}) {
  const { listField, id } = await params;
  return (
    <LayoutShell>
      <EntityForm listField={listField} entityId={id} action="view" />
    </LayoutShell>
  );
}
