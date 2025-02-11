import { useState } from 'react';
import { Button } from '@heroui/react';
import { Article } from '../types/article';

interface ArticleBoxProps {
  articles: Article[];
  loading: boolean;
}

export function ArticleBox({ articles, loading }: ArticleBoxProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  if (!articles.length) {
    return (
      <div className="text-center text-gray-600 py-12">
        {loading ? 'Loading...' : 'No articles'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {articles.map((article, index) => (
        <ArticleItem
          key={index}
          article={article}
          isExpanded={expandedIds.has(index)}
          onToggle={() => toggleExpand(index)}
        />
      ))}
      {loading && (
        <div className="text-center text-gray-600 py-4">
          Loading more...
        </div>
      )}
    </div>
  );
}

interface ArticleItemProps {
  article: Article;
  isExpanded: boolean;
  onToggle: () => void;
}

function ArticleItem({ article, isExpanded, onToggle }: ArticleItemProps) {
  const truncateText = (text: string, maxLength: number = 100) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{article.title}</h3>
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline block mb-4 break-all"
      >
        {article.link}
      </a>
      <div className="relative">
        <p className="text-gray-600 leading-relaxed">
          {isExpanded ? article.content : truncateText(article.content)}
        </p>
        <Button
          onPress={onToggle}
          className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
    </div>
  );
}
