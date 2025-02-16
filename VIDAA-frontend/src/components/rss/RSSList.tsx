import { RSSSourceItem } from './RSSSourceItem';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { useRSSSources } from '../../hooks/useRSSSources';
import { RSSListProps } from '../../types/rss';

export function RSSList({ onSelect, selectedIndex, displayMode = 'list' }: RSSListProps) {
  const { rssSources, loading, error } = useRSSSources();

  if (loading) {
    return <LoadingState message="Loading RSS sources..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (displayMode === 'tabs') {
    return (
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {rssSources.map((source) => (
            <button
              key={source.index}
              onClick={() => onSelect(source)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${selectedIndex === source.index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {source.name}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rssSources.map((source) => (
        <RSSSourceItem
          key={source.index}
          source={source}
          isSelected={selectedIndex === source.index}
          onClick={() => onSelect(source)}
        />
      ))}
    </div>
  );
}
