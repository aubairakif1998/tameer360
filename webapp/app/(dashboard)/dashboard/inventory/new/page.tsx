import { redirect } from 'next/navigation';

export default function NewStockEntryPage() {
  redirect('/dashboard/production/new');
}
