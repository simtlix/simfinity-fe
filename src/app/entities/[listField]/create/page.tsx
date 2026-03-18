"use client";

import * as React from "react";
import { EntityForm } from "@simtlix/simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";
import { useRouter, useSearchParams } from "next/navigation";
import { Paper } from "@mui/material";

function SearchParamsProvider({
  children,
}: {
  children: (searchParams: URLSearchParams) => React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const urlParams = new URLSearchParams(searchParams?.toString() ?? "");
  return <>{children(urlParams)}</>;
}

function CreateEntityPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ listField: string }>;
  searchParams: URLSearchParams;
}) {
  const router = useRouter();
  const [resolved, setResolved] = React.useState<{ listField: string } | null>(null);

  React.useEffect(() => {
    params.then(setResolved);
  }, [params]);

  const navigate = React.useCallback(
    (path: string) => router.push(path),
    [router]
  );

  if (!resolved) return null;

  const returnTo = searchParams.get("returnTo") ?? undefined;

  return (
    <LayoutShell>
      <Paper>
        <EntityForm
          listField={resolved.listField}
          action="create"
          onNavigate={navigate}
          returnTo={returnTo}
        />
      </Paper>
    </LayoutShell>
  );
}

export default function CreateEntityPage({
  params,
}: {
  params: Promise<{ listField: string }>;
}) {
  return (
    <React.Suspense fallback={null}>
      <SearchParamsProvider>
        {(searchParams) => (
          <CreateEntityPageContent params={params} searchParams={searchParams} />
        )}
      </SearchParamsProvider>
    </React.Suspense>
  );
}
