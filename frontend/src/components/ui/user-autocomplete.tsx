'use client';

import { useState, useRef, useEffect } from 'react';
import { useUsers } from '@/hooks';
import { Search, User, X } from 'lucide-react';

interface SelectedUser {
  id: string;
  name: string;
  email: string;
}

interface Props {
  label?: string;
  onSelect: (user: SelectedUser | null) => void;
  onNameChange?: (name: string) => void;
  value?: string;
  placeholder?: string;
}

export function UserAutocomplete({ label, onSelect, onNameChange, value = '', placeholder = 'Rechercher un client...' }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedUser | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const { data: usersData } = useUsers();
  const allUsers = usersData?.data || [];

  // Exclure les admins — seuls les clients et agents peuvent être des réclamants
  const clientUsers = allUsers.filter((u: any) =>
    !['super_admin', 'org_admin', 'quality_manager', 'service_manager'].includes(u.role)
  );

  const filtered = query.length >= 2
    ? clientUsers.filter((u: any) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (user: any) => {
    const sel = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    };
    setSelected(sel);
    setQuery(sel.name);
    setOpen(false);
    onSelect(sel);
    onNameChange?.(sel.name);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    onSelect(null);
    onNameChange?.('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    onSelect(null);
    onNameChange?.(val);
    setOpen(val.length >= 2);
  };

  return (
    <div className="space-y-1.5" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a1a1a] pl-9 pr-9 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1a1a] shadow-lg overflow-hidden">
            {filtered.length > 0 ? (
              <>
                <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Clients enregistrés
                </div>
                {filtered.map((user: any) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelect(user)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-[#222] transition-colors text-left"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                      <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                  </button>
                ))}
                <div className="px-3 py-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  Ou continuer avec "<span className="font-medium">{query}</span>"
                </div>
              </>
            ) : (
              <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                Aucun client trouvé · "<span className="font-medium">{query}</span>" sera utilisé comme nom
              </div>
            )}
          </div>
        )}
      </div>
      {selected && (
        <p className="text-xs text-primary-600 dark:text-primary-400">
          ✓ Client sélectionné · email auto-rempli
        </p>
      )}
    </div>
  );
}
