import { RSSSource } from '../../types/rss';

interface RSSSourceItemProps {
  source: RSSSource;
  isSelected: boolean;
  onClick: (source: RSSSource) => void;
}

export function RSSSourceItem({ source, isSelected, onClick }: RSSSourceItemProps) {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500'
      }`}
      onClick={() => onClick(source)}
    >
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        {source.name}
      </h3>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {source.url}
      </a>
    </div>
  );
}
