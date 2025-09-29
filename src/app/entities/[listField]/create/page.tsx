"use client"
import * as React from "react";
import {EntityForm} from "@simtlix/simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Paper } from "@mui/material";

export default function CreateEntityPage({
  params,
}: {
  params: Promise<{ listField: string }>;
}) {
  const { listField } = React.use(params);
  const router = useRouter();

  const navigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);
  
  return (
    <LayoutShell>
      <Paper>
        <EntityForm listField={listField} action="create" onNavigate={navigate} />
      </Paper>
    </LayoutShell>
  );
}
