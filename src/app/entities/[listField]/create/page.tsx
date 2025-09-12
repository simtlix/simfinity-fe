import * as React from "react";
import EntityForm from "@/components/simfinity-fe/EntityForm";
import LayoutShell from "@/components/app/LayoutShell";

export default async function CreateEntityPage({
  params,
}: {
  params: Promise<{ listField: string }>;
}) {
  const { listField } = await params;
  return (
    <LayoutShell>
      <EntityForm listField={listField} action="create" />
    </LayoutShell>
  );
}
