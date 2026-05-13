import AdminArea from '../../../components/AdminArea';

interface Props {
  params: { storeId: string };
}

export default function DashboardPage({ params }: Props) {
  return <AdminArea storeId={params.storeId} />;
}
