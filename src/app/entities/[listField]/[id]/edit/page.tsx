"use client"

import * as React from "react";
import {EntityForm} from "simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";

export default function EditEntityPage({
  params,
}: {
  params: { listField: string; id: string };
}) {
  const { listField, id } = params;
  return (
    <LayoutShell>
      <EntityForm listField={listField} entityId={id} action="edit" />
    </LayoutShell>
  );
}
