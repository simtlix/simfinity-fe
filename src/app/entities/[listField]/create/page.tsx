"use client"
import * as React from "react";
import {EntityForm} from "@simtlix/simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

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
      <EntityForm listField={listField} action="create" onNavigate={navigate} />
    </LayoutShell>
  );
}
