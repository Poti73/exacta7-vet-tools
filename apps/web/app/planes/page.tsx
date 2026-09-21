import { Pricing } from '../../components/pricing';

// Pricing is business-critical and must not be served from a year-long static cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = { title: 'Planes' };

export default function Page() {
  return <Pricing />;
}
