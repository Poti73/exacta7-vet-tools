import { redirect } from 'next/navigation';
import { AdminCrmTable } from '../../../components/admin-crm-table';
import { getCrmData, isAdminEmail } from '../../../lib/admin';
import { createClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'CRM Propietario · Exacta7',
  robots: { index: false, follow: false },
};

export default async function AdminCrmPage() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === 'string' ? claimsData.claims.sub : null;

  if (claimsError || !userId) {
    redirect('/acceso?next=/admin/crm');
  }

  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email;

  if (!isAdminEmail(email)) {
    redirect('/cuenta');
  }

  const { users, stats } = await getCrmData();

  return (
    <main className="wrap main">
      <div className="page-intro compact">
        <p className="eyebrow green">PANEL DE PROPIETARIO</p>
        <h1>CRM & Suscripciones</h1>
        <p className="lead">
          Control centralizado de usuarios registrados, categoría de plan y estado de suscripción sincronizado con Stripe.
        </p>
      </div>

      <AdminCrmTable initialUsers={users} stats={stats} />
    </main>
  );
}
