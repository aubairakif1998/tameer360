import { DispatchInvoicePage } from '@/components/documents/dispatch-invoice-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DispatchInvoicePage id={id} />;
}
