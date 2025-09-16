"use client"
import * as React from "react";
import {EntityForm} from "simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";

export default function CreateEntityPage({
  params,
}: {
  params: { listField: string };
}) {
  const { listField } = params;
  return (
    <LayoutShell>
      <EntityForm listField={listField} action="create" />
    </LayoutShell>
  );
}
