export interface Article {
    title: string;
    link: string;
    content: string;
    type?: string;
    error?: string;
  }

export interface ArticleBoxProps {
  articles: Article[];
  loading: boolean;
  onArticleSelect?: (article: Article, selected: boolean) => void;
  selectedArticles?: Article[];
}

export interface ArticleCardProps {
  article: Article;
  isSelected: boolean;
  onSelect: (article: Article) => void;
  onShowMore: () => void;
}

export interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}
