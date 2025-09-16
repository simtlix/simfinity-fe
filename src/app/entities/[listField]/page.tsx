"use client"

import * as React from "react";
import {EntityTable} from "simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";

export default function EntityPage({
  params,
}: {
  params: { listField: string };
}) {
  const { listField } =  params;
  return (
    <LayoutShell>
      <EntityTable listField={listField} />
    </LayoutShell>
  );
}


