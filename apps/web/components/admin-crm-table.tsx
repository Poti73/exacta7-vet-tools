'use client';

import { useMemo, useState } from 'react';
import type { CrmStats, CrmUserSummary } from '../lib/admin';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function AdminCrmTable({
  initialUsers,
  stats,
}: {
  initialUsers: CrmUserSummary[];
  stats: CrmStats;
}) {
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'pro' | 'free'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredUsers = useMemo(() => {
    return initialUsers.filter(user => {
      const matchesSearch =
        search.trim() === '' ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase()) ||
        (user.stripeCustomerId && user.stripeCustomerId.toLowerCase().includes(search.toLowerCase()));

      const matchesPlan =
        filterPlan === 'all' ||
        (filterPlan === 'pro' && user.plan === 'Pro') ||
        (filterPlan === 'free' && user.plan === 'Free');

      const matchesStatus =
        filterStatus === 'all' || user.subscriptionStatus === filterStatus;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [initialUsers, search, filterPlan, filterStatus]);

  return (
    <div className="crm-container">
      {/* KPI Cards */}
      <div className="crm-kpi-grid">
        <div className="crm-kpi-card">
          <span className="eyebrow green">TOTAL USUARIOS</span>
          <strong className="crm-kpi-val">{stats.totalUsers}</strong>
          <small className="muted">Registrados en la plataforma</small>
        </div>
        <div className="crm-kpi-card">
          <span className="eyebrow green">SUSCRIPCIONES PRO</span>
          <strong className="crm-kpi-val green">{stats.proUsers}</strong>
          <small className="muted">Usuarios con plan activo</small>
        </div>
        <div className="crm-kpi-card">
          <span className="eyebrow green">USUARIOS FREE</span>
          <strong className="crm-kpi-val">{stats.freeUsers}</strong>
          <small className="muted">Sin suscripción activa</small>
        </div>
        <div className="crm-kpi-card">
          <span className="eyebrow green">EN CANCELACIÓN</span>
          <strong className="crm-kpi-val" style={{ color: stats.cancelingUsers > 0 ? '#b88b31' : 'inherit' }}>
            {stats.cancelingUsers}
          </strong>
          <small className="muted">Cancelan fin de ciclo</small>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="crm-toolbar panel">
        <div className="crm-search-input">
          <label htmlFor="crm-search" className="sr-only">Buscar usuario</label>
          <input
            id="crm-search"
            type="search"
            placeholder="Buscar por email, ID o Stripe Customer ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="crm-filters">
          <select
            value={filterPlan}
            onChange={e => setFilterPlan(e.target.value as any)}
            aria-label="Filtrar por plan"
          >
            <option value="all">Todos los planes</option>
            <option value="pro">Solo Exacta7 Pro</option>
            <option value="free">Solo Exacta7 Free</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            aria-label="Filtrar por estado de suscripción"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activa (active)</option>
            <option value="trialing">En prueba (trialing)</option>
            <option value="past_due">Pago pendiente (past_due)</option>
            <option value="canceled">Cancelada (canceled)</option>
            <option value="sin suscripción">Sin suscripción</option>
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="crm-table-wrapper panel">
        <div className="crm-table-header-info">
          <h2>Listado de Clientes ({filteredUsers.length})</h2>
          {search && <span className="small-text muted">Filtrado por: "{search}"</span>}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron usuarios que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Usuario / Email</th>
                  <th>Categoría</th>
                  <th>Estado Suscripción</th>
                  <th>Stripe Customer</th>
                  <th>Fecha Registro</th>
                  <th>Próx. Renovación</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.email}</strong>
                      <span className="small-text muted crm-user-id">{user.id}</span>
                    </td>
                    <td>
                      <span className={`tag ${user.plan === 'Pro' ? 'tag-pro' : ''}`}>
                        {user.plan === 'Pro' ? '★ Exacta7 Pro' : 'Exacta7 Free'}
                      </span>
                    </td>
                    <td>
                      <span className={`crm-status-pill status-${user.subscriptionStatus}`}>
                        {user.subscriptionStatus}
                      </span>
                      {user.cancelAtPeriodEnd && (
                        <span className="crm-badge-warning" title="No renovará">
                          Cancela fin ciclo
                        </span>
                      )}
                    </td>
                    <td>
                      {user.stripeCustomerId ? (
                        <a
                          href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="crm-stripe-link"
                          title="Abrir en Stripe"
                        >
                          <code>{user.stripeCustomerId}</code> ↗
                        </a>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="small-text">{formatDate(user.createdAt)}</span>
                    </td>
                    <td>
                      <span className="small-text">
                        {user.currentPeriodEnd ? formatDate(user.currentPeriodEnd) : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
