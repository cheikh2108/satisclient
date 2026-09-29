'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { QrCode, Plus, Download, Eye, Copy, Check, Trash2, RefreshCw } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/skeleton';
import {
  useQRCodes,
  useQRCodeStats,
  useCreateQRCode,
  useUpdateQRCode,
  useCurrentUser,
  useDeleteQRCode,
  useRegenerateQRCode,
  useSites,
} from '@/hooks';

// Extended interface covering both current type fields and actual backend response fields
interface BackendQRCode {
  id: string;
  code: string;
  targetType?: string;        // lowercase: 'feedback', 'survey', etc.
  destinationUrl?: string;
  qrImageUrl?: string | null;
  isActive: boolean;
  scanCount: number;
  lastScannedAt?: string | null;
  createdAt: string;
  site?: { id: string; name: string; code: string };
  organization?: { id: string; name: string };
  // Anciens champs pour compatibilité rétro
  name?: string;
  url?: string;
  siteName?: string;
  type?: string;
}

const StatCard = ({ label, value, change, isPositive = true }: { label: string; value: string; change: string; isPositive?: boolean }) => (
  <div className="rounded-xl bg-slate-50/50 dark:bg-[#0a0a0a]/50 border border-slate-200/50 dark:border-slate-800/50 p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
          {label}
        </p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
      <span className={`text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {change}
      </span>
    </div>
  </div>
);

export default function QRCodesPage() {
  const [selectedQR, setSelectedQR] = useState<BackendQRCode | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formSiteId, setFormSiteId] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const { addToast } = useToast();

  const { data: currentUser } = useCurrentUser();
  const { data: qrCodesData, isLoading, error } = useQRCodes({ includeRelations: true } as any);
  const { data: stats } = useQRCodeStats();
  const { data: sitesData } = useSites();
  const createQRCode = useCreateQRCode();
  const updateQRCode = useUpdateQRCode();
  const deleteQRCode = useDeleteQRCode();
  const regenerateQRCode = useRegenerateQRCode();

  const qrCodes = (qrCodesData?.data || []) as BackendQRCode[];
  const sites = sitesData?.data || [];

  const getDisplayName = (qr: BackendQRCode) => qr.name || qr.code || '-';
  const getDisplayUrl = (qr: BackendQRCode) => qr.url || qr.destinationUrl || '-';
  const getDisplaySite = (qr: BackendQRCode) => qr.site?.name || qr.siteName || '-';
  const getDisplayType = (qr: BackendQRCode) => {
    const t = qr.targetType || qr.type || '';
    const labels: Record<string, string> = { feedback: 'Feedback', survey: 'Enquête', generic: 'Général', redirect: 'Redirection', FEEDBACK: 'Feedback', SURVEY: 'Enquête', REDIRECT: 'Redirection' };
    return labels[t] || t || '—';
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({ type: 'success', title: 'URL copiée' });
  };

  const handleDownloadQR = (qr: BackendQRCode) => {
    if (qr.qrImageUrl) {
      const a = document.createElement('a');
      a.href = qr.qrImageUrl;
      a.download = `${getDisplayName(qr)}.png`;
      a.click();
    }
    addToast({ type: 'info', title: 'QR Code téléchargé' });
  };

  const handleToggleActive = (qr: BackendQRCode) => {
    updateQRCode.mutate({ id: qr.id, data: { isActive: !qr.isActive } });
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce QR Code ?')) {
      deleteQRCode.mutate(id);
      if (selectedQR?.id === id) setShowDetailModal(false);
    }
  };

  const handleRegenerate = (id: string) => {
    regenerateQRCode.mutate(id);
  };

  const handleCreate = () => {
    if (!formType || !formSiteId) {
      addToast({ type: 'error', title: 'Veuillez remplir tous les champs' });
      return;
    }
    createQRCode.mutate(
      {
        siteId: formSiteId,
        type: formType || 'feedback',
        organizationId: (currentUser as any)?.organizationId || '',
        customUrl: formUrl || undefined,
      } as any,
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setFormName('');
          setFormType('');
          setFormSiteId('');
          setFormUrl('');
        },
      }
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FEEDBACK':
      case 'Feedback': return 'text-primary-600 dark:text-primary-400';
      case 'SURVEY':
      case 'Enquête': return 'text-blue-600 dark:text-blue-400';
      case 'REDIRECT':
      case 'Redirection': return 'text-purple-600 dark:text-purple-400';
      case 'Général': return 'text-slate-600 dark:text-slate-400';
      default: return '';
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'NOM',
      sortable: true,
      render: (qr: BackendQRCode) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{getDisplayName(qr)}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{getDisplaySite(qr)}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'TYPE',
      render: (qr: BackendQRCode) => {
        const t = getDisplayType(qr);
        return (
          <span className={`text-sm font-medium ${getTypeColor(t)}`}>
            {t}
          </span>
        );
      },
    },
    {
      key: 'url',
      label: 'URL',
      render: (qr: BackendQRCode) => {
        const url = getDisplayUrl(qr);
        return (
          <div className="flex items-center gap-2">
            <code className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
              {url}
            </code>
            <button
              onClick={() => handleCopyUrl(url, qr.id)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
            >
              {copiedId === qr.id ? (
                <Check className="h-4 w-4 text-primary-600" />
              ) : (
                <Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      key: 'scanCount',
      label: 'SCANS',
      sortable: true,
      render: (qr: BackendQRCode) => (
        <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
          {qr.scanCount}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'STATUT',
      render: (qr: BackendQRCode) => (
        <span className={`text-sm font-medium ${qr.isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-500'}`}>
          {qr.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'lastScannedAt',
      label: 'DERNIER SCAN',
      render: (qr: BackendQRCode) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {qr.lastScannedAt ? new Date(qr.lastScannedAt).toLocaleDateString('fr-FR') : 'Jamais'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (qr: BackendQRCode) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedQR(qr);
              setShowDetailModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => handleDownloadQR(qr)}
            className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Download className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 dark:text-white leading-tight">
            QR Codes
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Générez et gérez vos QR codes
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Générer QR Code</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total QR Codes" value={stats?.totalQrCodes?.toString() ?? '—'} change={(stats?.totalQrCodes??0)>0 ? `${Math.round(((stats?.activeQrCodes??0)/Math.max(stats?.totalQrCodes??1,1))*100)}%` : '—'} isPositive />
        <StatCard
          label="Total Scans"
          value={stats?.totalScans ? stats.totalScans.toLocaleString('fr-FR') : '0'}
          change="—"
          isPositive
        />
        <StatCard label="Actifs" value={stats?.activeQrCodes?.toString() ?? '0'} change={(stats?.totalQrCodes ?? 0) > 0 ? `${Math.round(((stats?.activeQrCodes ?? 0) / stats!.totalQrCodes) * 100)}% du total` : '—'} isPositive />
      </div>

      {/* Loading / Error / Table */}
      {isLoading ? (
        <SkeletonTable />
      ) : error ? (
        <div className="rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/10 p-6 text-center text-sm text-red-600 dark:text-red-400">
          Impossible de charger les QR codes. Veuillez réessayer.
        </div>
      ) : (
        <Table
          data={qrCodes}
          columns={columns}
          pagination={{
            page,
            pageSize: 10,
            total: qrCodesData?.meta?.total ?? qrCodes.length,
            onPageChange: setPage,
          }}
          sortable
        />
      )}

      {/* Detail Modal */}
      {selectedQR && (
        <Modal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails du QR Code"
          size="lg"
        >
          <div className="space-y-6">
            {/* QR Code Preview */}
            <div className="flex justify-center">
              <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f0f]">
                {selectedQR.qrImageUrl ? (
                  <img
                    src={selectedQR.qrImageUrl}
                    alt="QR Code"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom
                </label>
                <p className="text-slate-900 dark:text-white">{getDisplayName(selectedQR)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Site
                </label>
                <p className="text-slate-900 dark:text-white">{getDisplaySite(selectedQR)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Type
                </label>
                <span className={`text-sm font-medium ${getTypeColor(getDisplayType(selectedQR))}`}>
                  {getDisplayType(selectedQR)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Scans
                </label>
                <p className="text-slate-900 dark:text-white font-semibold">{selectedQR.scanCount}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                URL de destination
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-slate-800/60 text-sm text-slate-900 dark:text-white">
                  {getDisplayUrl(selectedQR)}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(getDisplayUrl(selectedQR), selectedQR.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant={selectedQR.isActive ? 'outline' : 'primary'}
                onClick={() => handleToggleActive(selectedQR)}
                className="flex-1"
              >
                {selectedQR.isActive ? 'Désactiver' : 'Activer'}
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDownloadQR(selectedQR)}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleRegenerate(selectedQR.id)}
                disabled={regenerateQRCode.isPending}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Régénérer
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDelete(selectedQR.id)}
                disabled={deleteQRCode.isPending}
                className="flex-1 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Générer un QR Code"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800/60 p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Le code QR sera généré automatiquement selon le site sélectionné (ex: <span className="font-mono font-medium">QR-DKR-PLT-001</span>)
            </p>
          </div>
          <Select
            label="Type"
            options={[
              { value: 'feedback', label: 'Feedback' },
              { value: 'survey', label: 'Enquête' },
              { value: 'generic', label: 'Générique' },
            ]}
            placeholder="Sélectionner un type"
            required
            value={formType}
            onChange={(val) => setFormType(val)}
          />
          <Select
            label="Site"
            options={sites.map((site) => ({ value: site.id, label: site.name }))}
            placeholder="Sélectionner un site"
            required
            value={formSiteId}
            onChange={(val) => setFormSiteId(val)}
          />
          <Input
            label="URL de destination"
            placeholder="https://..."
            required
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
          />
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={createQRCode.isPending}
          >
            {createQRCode.isPending ? 'Génération...' : 'Générer'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
