import { useState } from 'react';
import { Progress } from '@heroui/react';
import { ArticleCard } from './ArticleCard';
import { ArticleModal } from './ArticleModal';
import { Article, ArticleBoxProps } from '../../types/article';

export function ArticleBox({ articles, loading, onArticleSelect, selectedArticles = [] }: ArticleBoxProps) {
  const [expandedArticle, setExpandedArticle] = useState<Article | null>(null);

  const handleArticleSelect = (article: Article) => {
    onArticleSelect?.(article, !selectedArticles.some(selected => selected.link === article.link));
  };

  if (!articles.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center">
          {loading ? (
            <>
              <Progress
                size="sm"
                isIndeterminate
                aria-label="Loading..."
                className="max-w-md mb-4"
              />
              <p className="text-gray-600">Loading articles...</p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold text-gray-800 mb-2">No Articles Found</p>
              <p className="text-gray-600">Try selecting a different RSS source</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <div
            key={index}
            className="group relative cursor-pointer"
            onClick={() => handleArticleSelect(article)}
          >
            <ArticleCard
              article={article}
              isSelected={selectedArticles.some(selected => selected.link === article.link)}
              onSelect={handleArticleSelect}
              onShowMore={() => setExpandedArticle(article)}
            />
          </div>
        ))}
        {loading && (
          <div className="col-span-full">
            <Progress
              size="sm"
              isIndeterminate
              aria-label="Loading more..."
              className="max-w-md mx-auto"
            />
          </div>
        )}
      </div>

      <ArticleModal
        article={expandedArticle}
        isOpen={expandedArticle !== null}
        onClose={() => setExpandedArticle(null)}
      />
    </>
  );
}
