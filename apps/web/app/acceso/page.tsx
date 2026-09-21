import { AuthForm } from '../../components/auth-form';

export const metadata = { title: 'Acceso', robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthForm nextPath={next} />;
}
