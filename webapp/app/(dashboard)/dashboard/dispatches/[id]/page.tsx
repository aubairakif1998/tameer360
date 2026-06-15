'use client';

import { useEffect, useState } from 'react';
import { DispatchDetailView } from '@/components/dispatches/dispatch-detail';

export default function DispatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  if (!id) return null;

  return <DispatchDetailView id={id} />;
}
