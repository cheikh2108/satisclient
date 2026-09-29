'use client';

import { useState } from 'react';
import { Calendar, Filter, Download, X } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/datepicker';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useSites } from '@/hooks';

interface FilterBarProps {
  onExport?: () => void;
}

export function FilterBar({ onExport }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const { addToast } = useToast();
  const { data: sitesData } = useSites();

  const sites = [
    { value: '', label: 'Tous les sites' },
    ...(sitesData?.data || []).map((s) => ({ value: s.id, label: s.name })),
  ];

  const handleExport = () => {
    addToast({
      type: 'success',
      title: 'Export en cours',
      description: 'Votre rapport sera téléchargé dans quelques instants',
    });
    onExport?.();
  };

  const handleApplyFilters = () => {
    addToast({
      type: 'info',
      title: 'Filtres appliqués',
      description: `Période: ${startDate || 'N/A'} - ${endDate || 'N/A'}`,
    });
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedSite('');
    addToast({
      type: 'info',
      title: 'Filtres réinitialisés',
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a] px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222222] active:scale-95 transition-all"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden xs:inline">Filtrer</span>
          {(startDate || endDate || selectedSite) && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-bold">
              {[startDate, endDate, selectedSite].filter(Boolean).length}
            </span>
          )}
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-3 sm:px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
        >
          <Download className="h-4 w-4" />
          <span className="hidden xs:inline">Exporter</span>
        </button>
      </div>

      {/* Filter Modal */}
      <Modal
        open={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filtres avancés"
        description="Personnalisez l'affichage de vos données"
        size="md"
      >
        <div className="space-y-6">
          <DateRangePicker
            label="Période"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            helperText="Sélectionnez une plage de dates pour filtrer les données"
          />

          <Select
            label="Site"
            options={sites}
            value={selectedSite}
            onChange={setSelectedSite}
            placeholder="Sélectionner un site"
            helperText="Filtrer les données par établissement"
          />

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button
              variant="primary"
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Appliquer les filtres
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
