'use client';

import { useRef, useState } from 'react';
import { Table } from '@/components/ui/table';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useUploadFile } from '@/hooks';
import { FileText, Plus, Eye, Download, Trash2, Upload, File, FileImage, FileSpreadsheet, Search } from 'lucide-react';

interface FileData {
  id: string;
  name: string;
  type: 'PDF' | 'IMAGE' | 'EXCEL' | 'WORD' | 'OTHER';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  category: string;
  url: string;
}

const mockFiles: FileData[] = [];

const parseFileSize = (size: string): number => {
  const match = size.match(/^([\d.]+)\s*(KB|MB|GB)$/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'KB') return num * 1024;
  if (unit === 'MB') return num * 1024 * 1024;
  if (unit === 'GB') return num * 1024 * 1024 * 1024;
  return num;
};

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

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

export default function FilesPage() {
  const [files, setFiles] = useState<FileData[]>(mockFiles);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const uploadFile = useUploadFile();

  const totalSizeBytes = files.reduce((sum, f) => sum + parseFileSize(f.size), 0);
  const totalSizeFormatted = formatSize(totalSizeBytes);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthCount = files.filter(f => {
    const date = new Date(f.uploadedAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'IMAGE': return <FileImage className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'EXCEL': return <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'WORD': return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default: return <File className="h-5 w-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      setFiles(files.filter(f => f.id !== id));
      addToast({ type: 'success', title: 'Fichier supprimé' });
    }
  };

  const handleDownload = (file: FileData) => {
    if (file.url && file.url !== '#') {
      window.open(file.url, '_blank');
    } else {
      addToast({ type: 'info', title: 'Fichier non disponible', description: 'L\'URL du fichier n\'est pas encore accessible.' });
    }
  };

  const handleUpload = () => {
    if (!uploadedFile) {
      addToast({ type: 'error', title: 'Sélectionnez un fichier' });
      return;
    }
    uploadFile.mutate({ file: uploadedFile }, {
      onSuccess: () => {
        setShowUploadModal(false);
        setUploadedFile(null);
      },
    });
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'NOM',
      sortable: true,
      render: (file: FileData) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
            {getFileIcon(file.type)}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{file.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'size',
      label: 'TAILLE',
      sortable: true,
      render: (file: FileData) => (
        <span className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">
          {file.size}
        </span>
      ),
    },
    {
      key: 'uploadedBy',
      label: 'UPLOADÉ PAR',
    },
    {
      key: 'uploadedAt',
      label: 'DATE',
      sortable: true,
      render: (file: FileData) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(file.uploadedAt).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (file: FileData) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedFile(file);
              setShowDetailModal(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => handleDownload(file)}
            className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Download className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </button>
          <button
            onClick={() => handleDelete(file.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
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
            Fichiers
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Gérez tous vos documents et fichiers
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden xs:inline">Uploader un fichier</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Fichiers" value={files.length.toString()} change="—" isPositive />
        <StatCard label="Taille totale" value={totalSizeFormatted} change="—" isPositive />
        <StatCard label="Ce mois" value={thisMonthCount.toString()} change="—" isPositive />
        <StatCard label="Documents" value={files.filter(f => f.type === 'PDF' || f.type === 'WORD').length.toString()} change="—" isPositive />
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un fichier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#1a1a1a] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-primary-600/30 focus:border-primary-600 dark:focus:border-primary-600 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        data={filteredFiles}
        columns={columns}
        pagination={{
          page,
          pageSize: 10,
          total: filteredFiles.length,
          onPageChange: setPage,
        }}
        sortable
      />

      {/* Detail Modal */}
      {selectedFile && (
        <Modal
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Détails du fichier"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                {getFileIcon(selectedFile.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white break-all">
                  {selectedFile.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedFile.type}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Taille
                </label>
                <p className="text-slate-900 dark:text-white">{selectedFile.size}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Catégorie
                </label>
                <p className="text-slate-900 dark:text-white">{selectedFile.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Uploadé par
                </label>
                <p className="text-slate-900 dark:text-white">{selectedFile.uploadedBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date d'upload
                </label>
                <p className="text-slate-900 dark:text-white">
                  {new Date(selectedFile.uploadedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
            <Button variant="primary" onClick={() => handleDownload(selectedFile)}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Upload Modal */}
      <Modal
        open={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadedFile(null);
        }}
        title="Uploader un fichier"
        size="md"
      >
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-primary-600 dark:hover:border-primary-600 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)}
            />
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
              {uploadedFile ? uploadedFile.name : 'Cliquez pour uploader ou glissez-déposez'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              PDF, Word, Excel, Images (max. 10MB)
            </p>
          </div>

          <Input label="Nom du fichier" placeholder="Ex: Rapport mensuel" />

          <Select
            label="Catégorie"
            options={[
              { value: 'Rapports', label: 'Rapports' },
              { value: 'Images', label: 'Images' },
              { value: 'Data', label: 'Data' },
              { value: 'Documents', label: 'Documents' },
              { value: 'Autre', label: 'Autre' },
            ]}
            placeholder="Sélectionner une catégorie"
            required
          />
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => {
            setShowUploadModal(false);
            setUploadedFile(null);
          }}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleUpload} disabled={uploadFile.isPending}>
            <Upload className="h-4 w-4 mr-2" />
            {uploadFile.isPending ? 'Upload...' : 'Uploader'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
