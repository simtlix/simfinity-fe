"use client";

import * as React from "react";
import { Autocomplete, Chip, TextField, Stack } from "@mui/material";
import type { GridFilterInputValueProps } from "@mui/x-data-grid";

export function TagsFilterInput(props: GridFilterInputValueProps) {
  const valueArray = Array.isArray(props.item.value) ? (props.item.value as unknown[]) : [];
  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={valueArray as string[]}
      onChange={(_, newValue) => {
        props.applyValue({ ...props.item, value: newValue });
      }}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => <Chip variant="outlined" label={option} {...getTagProps({ index })} key={`${option}-${index}`} />)
      }
      renderInput={(params) => <TextField {...params} size="small" placeholder="Values" />}
    />
  );
}

export function BetweenFilterInput(props: GridFilterInputValueProps & { inputType?: string }) {
  const arr = Array.isArray(props.item.value) ? (props.item.value as unknown[]) : [null, null];
  const [minVal, maxVal] = [arr[0] ?? "", arr[1] ?? ""] as (string | number)[];
  return (
    <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
      <TextField
        size="small"
        type={props.inputType ?? "text"}
        value={minVal}
        onChange={(e) => props.applyValue({ ...props.item, value: [e.target.value, maxVal] })}
        placeholder="Min"
        fullWidth
      />
      <TextField
        size="small"
        type={props.inputType ?? "text"}
        value={maxVal}
        onChange={(e) => props.applyValue({ ...props.item, value: [minVal, e.target.value] })}
        placeholder="Max"
        fullWidth
      />
    </Stack>
  );
}


