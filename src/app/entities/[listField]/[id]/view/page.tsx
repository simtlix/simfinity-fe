"use client"

import * as React from "react";
import {EntityForm} from "simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";

export default function ViewEntityPage({
  params,
}: {
  params: { listField: string; id: string };
}) {
  const { listField, id } = params;
  return (
    <LayoutShell>
      <EntityForm listField={listField} entityId={id} action="view" />
    </LayoutShell>
  );
}
