export interface RSSSource {
  index: number;
  name: string;
  url: string;
}

export interface RSSListProps {
  onSelect: (source: RSSSource | null) => void;
  onConfirm: () => void;
  selectedIndex?: number;
  displayMode?: 'tabs' | 'list';
}
