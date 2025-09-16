"use client"
import * as React from "react";
import {EntityForm} from "@simtlix/simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";

export default function CreateEntityPage({
  params,
}: {
  params: Promise<{ listField: string }>;
}) {
  const { listField } = React.use(params);
  return (
    <LayoutShell>
      <EntityForm listField={listField} action="create" />
    </LayoutShell>
  );
}
