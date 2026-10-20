"use client";

import ErrorAman from "@/components/ErrorAman";

export default function ErrorAdmin({ retry }) {
  return <ErrorAman retry={retry} konteks="admin" />;
}
