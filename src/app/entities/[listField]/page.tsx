"use client"

import * as React from "react";
import {EntityTable} from "@simtlix/simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";
import { Paper } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function EntityPage({
  params,
}: {
  params: Promise<{ listField: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const getSearchParams = useCallback(() => {
    return searchParams;
  }, [searchParams]);

  const onSearchParamsChange = useCallback((params: URLSearchParams) => {
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl);
  }, [router]);
  const { listField } = React.use(params);
  return (
    <LayoutShell>
      <Paper>
        <EntityTable listField={listField} onNavigate={navigate} getSearchParams={getSearchParams} onSearchParamsChange={onSearchParamsChange} />
      </Paper>
    </LayoutShell>
  );
}


