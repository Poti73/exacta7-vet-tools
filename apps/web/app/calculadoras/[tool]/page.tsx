import { notFound } from 'next/navigation';
import { findCalculator } from '@exacta7/clinical-core';
import { substances } from '@exacta7/knowledge';
import { findRegulatoryProduct, toRegulatoryCalculatorProduct } from '@exacta7/knowledge/regulatory';
import { CalculatorScreen, SimpleCalculatorScreen } from '../../../components/localized-headings';
import { isProSubscription, type UserAccessState } from '../../../lib/billing';
import { createClient } from '../../../lib/supabase/server';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params; const calculator = findCalculator(tool);
  if (!calculator || calculator.reviewState !== 'published') return { title: 'Calculadora' };
  return { title: calculator.name.es, description: `${calculator.description.es} Operación matemática con unidades visibles y valores seleccionados por el profesional.`, alternates: { canonical: `/calculadoras/${tool}` }, openGraph: { title: `${calculator.name.es} · Exacta7`, description: calculator.description.es } };
}

async function getUserAccessState(): Promise<UserAccessState> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return { isAuthenticated: false, isPro: false, userId: null };
  }
  try {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const userId = typeof claimsData?.claims?.sub === 'string' ? claimsData.claims.sub : null;
    if (claimsError || !userId) {
      return { isAuthenticated: false, isPro: false, userId: null };
    }
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('status, stripe_price_id, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);
    const isPro = isProSubscription(subscriptions?.[0] ?? null);
    return { isAuthenticated: true, isPro, userId };
  } catch {
    return { isAuthenticated: false, isPro: false, userId: null };
  }
}

export default async function Page({ params, searchParams }: { params: Promise<{tool: string}>; searchParams: Promise<{medicamento?: string}> }) {
  const { tool } = await params;
  const metadata = findCalculator(tool);
  if (!metadata || metadata.reviewState !== 'published') notFound();

  if (tool === 'unit-converter' || tool === 'dilutions' || tool === 'drip-rate') {
    const accessState = await getUserAccessState();
    const proAllowed = metadata.plan === 'free' || accessState.isPro;
    return <SimpleCalculatorScreen tool={tool} proAllowed={proAllowed} accessState={accessState} />;
  }

  if (tool !== 'dose' && tool !== 'cri' && tool !== 'fluidos') notFound();
  const { medicamento } = await searchParams;
  const drug = substances.find(d => d.slug === medicamento);
  const regulatoryProduct = medicamento ? findRegulatoryProduct(medicamento) : undefined;
  if (medicamento && !drug && !regulatoryProduct) notFound();
  return <CalculatorScreen tool={tool} substanceId={drug?.id} drugName={drug?.name ?? regulatoryProduct?.name} regulatoryProduct={regulatoryProduct ? toRegulatoryCalculatorProduct(regulatoryProduct) : undefined}/>;
}
