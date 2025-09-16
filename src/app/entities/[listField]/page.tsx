"use client"

import * as React from "react";
import {EntityTable} from "@simtlix/simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";

export default function EntityPage({
  params,
}: {
  params: Promise<{ listField: string }>;
}) {
  const { listField } = React.use(params);
  return (
    <LayoutShell>
      <EntityTable listField={listField} />
    </LayoutShell>
  );
}


