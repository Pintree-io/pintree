"use client";

interface FolderCardProps {
  name: string;
  icon?: string;
  onClick: () => void;
}

export function FolderCard({ name, icon, onClick }: FolderCardProps) {
  return (
    <button
      onClick={onClick}
      className="p-4 bg-muted/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-muted dark:hover:bg-gray-800 transition-colors w-full"
    >
      <div className="flex flex-row items-center gap-4">
        {icon ? (
          <img src={icon} alt={name} className="w-12 h-12" />
        ) : (
          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        )}
        <span className="text-sm truncate">{name}</span>
      </div>
    </button>
  );
}
