import * as React from "react";
import EntityForm from "@/components/simfinity-fe/EntityForm";
import LayoutShell from "@/components/app/LayoutShell";

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
