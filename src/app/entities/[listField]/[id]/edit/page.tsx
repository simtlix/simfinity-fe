"use client"

import * as React from "react";
import {EntityForm} from "@simtlix/simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Paper } from "@mui/material";

export default function EditEntityPage({
  params,
}: {
  params: Promise<{ listField: string; id: string }>;
}) {
  const { listField, id } = React.use(params);
  const router = useRouter();

  const navigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);
  
  return (
    <LayoutShell>
      <Paper>
        <EntityForm listField={listField} entityId={id} action="edit" onNavigate={navigate} />
      </Paper>
    </LayoutShell>
  );
}
