"use client";

import * as React from "react";
import { EntityCardList, useI18n } from "@simtlix/simfinity-fe-components";
import LayoutShell from "@/components/app/LayoutShell";
import { Paper, Stack, Link } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { SerieCard } from "@/components/custom";

const SERIE_LIST_FIELD = "series";

/** Thin wrapper that isolates useSearchParams (which can suspend). Must be inside Suspense. */
function SearchParamsProvider({
  children,
}: {
  children: (searchParams: URLSearchParams) => React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const urlParams = new URLSearchParams(searchParams?.toString() ?? "");
  return <>{children(urlParams)}</>;
}

function EntityCardsPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ listField: string }>;
  searchParams: URLSearchParams;
}) {
  const router = useRouter();
  const { resolveLabel } = useI18n();
  const [resolved, setResolved] = React.useState<{ listField: string } | null>(null);

  React.useEffect(() => {
    params.then(setResolved);
  }, [params]);

  const navigate = React.useCallback(
    (path: string) => router.push(path),
    [router]
  );

  const getSearchParams = React.useCallback(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  const onSearchParamsChange = React.useCallback(
    (nextParams: URLSearchParams) => {
      router.replace(`${window.location.pathname}?${nextParams.toString()}`);
    },
    [router]
  );

  React.useEffect(() => {
    if (resolved && resolved.listField !== SERIE_LIST_FIELD) {
      router.replace(`/entities/${resolved.listField}`);
    }
  }, [resolved, router]);

  if (!resolved || resolved.listField !== SERIE_LIST_FIELD) {
    return null;
  }

  const listField = resolved.listField;
  const viewAsTableLabel = resolveLabel(
    ["nav.viewAsTable"],
    { entity: listField },
    "View as table"
  );

  return (
    <LayoutShell>
      <Paper>
        <Stack spacing={1}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate(`/entities/${listField}`)}
            sx={{ alignSelf: "flex-start" }}
          >
            {viewAsTableLabel}
          </Link>
          <EntityCardList
            listField={listField}
            renderCard={(item, _reload, onNavigate) => (
              <SerieCard
                item={item}
                listField={listField}
                onNavigate={onNavigate ?? navigate}
              />
            )}
            getSearchParams={getSearchParams}
            onSearchParamsChange={onSearchParamsChange}
            onNavigate={navigate}
            showFilterPanel={true}
          />
        </Stack>
      </Paper>
    </LayoutShell>
  );
}

export default function EntityCardsPage({
  params,
}: {
  params: Promise<{ listField: string }>;
}) {
  return (
    <React.Suspense fallback={null}>
      <SearchParamsProvider>
        {(searchParams) => (
          <EntityCardsPageContent params={params} searchParams={searchParams} />
        )}
      </SearchParamsProvider>
    </React.Suspense>
  );
}
