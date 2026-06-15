import { CustomerDetailView } from '@/components/customers/customer-detail';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerDetailView id={id} />;
}
