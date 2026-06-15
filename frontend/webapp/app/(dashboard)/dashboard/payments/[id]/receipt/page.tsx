import { PaymentReceiptPage } from '@/components/documents/payment-receipt-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PaymentReceiptPage id={id} />;
}
