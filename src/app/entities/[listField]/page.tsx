import * as React from "react";
import EntityTable from "@/components/EntityTable";
import LayoutShell from "@/components/LayoutShell";

export default async function EntityPage({
  params,
}: {
  params: Promise<{ listField: string }>;
}) {
  const { listField } = await params;
  return (
    <LayoutShell>
      <EntityTable listField={listField} />
    </LayoutShell>
  );
}


