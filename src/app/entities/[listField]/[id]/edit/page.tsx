"use client"

import * as React from "react";
import {EntityForm} from "@simtlix/simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";

export default function EditEntityPage({
  params,
}: {
  params: Promise<{ listField: string; id: string }>;
}) {
  const { listField, id } = React.use(params);
  return (
    <LayoutShell>
      <EntityForm listField={listField} entityId={id} action="edit" />
    </LayoutShell>
  );
}
