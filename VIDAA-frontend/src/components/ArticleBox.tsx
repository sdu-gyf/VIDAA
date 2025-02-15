import { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Link,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@heroui/react';
import { Article } from '../types/article';

interface ArticleBoxProps {
  articles: Article[];
  loading: boolean;
  onArticleSelect?: (article: Article, selected: boolean) => void;
  selectedArticles?: Article[];
}

export function ArticleBox({ articles, loading, onArticleSelect, selectedArticles = [] }: ArticleBoxProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const isArticleSelected = (article: Article) => {
    return selectedArticles.some(selected => selected.link === article.link);
  };

  const openArticle = (index: number) => {
    setExpandedId(index);
  };

  const closeArticle = () => {
    setExpandedId(null);
  };

  const handleCardPress = (article: Article) => {
    onArticleSelect?.(article, !isArticleSelected(article));
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleShowMore = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    openArticle(index);
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

  // Set a fixed preview length for all articles
  const truncateText = (text: string, maxLength: number = 150) =>
    text.length > maxLength
      ? `${text.substring(0, maxLength).trim()}...`
      : text;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <div
            key={index}
            className={`group relative cursor-pointer`}
            onClick={() => handleCardPress(article)}
          >
            <Card
              className={`max-w-[400px] border-2 rounded-2xl overflow-hidden shadow-xl
                ${isArticleSelected(article)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 group-hover:border-blue-300 group-hover:shadow-2xl group-hover:-translate-y-1'
                } transition-all duration-200`}
              shadow="none"
            >
              <CardHeader className="flex gap-3 h-[80px]">
                <div className="flex flex-col flex-grow">
                  <p className="text-md font-medium line-clamp-2">{article.title}</p>
                  <p className="text-small text-default-500 mt-1">
                    {new URL(article.link).hostname}
                  </p>
                </div>
                {isArticleSelected(article) && (
                  <div className="text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                )}
              </CardHeader>
              <Divider/>
              <CardBody>
                <p className="line-clamp-4">
                  {truncateText(article.content, 300)}
                </p>
              </CardBody>
              <Divider/>
              <CardFooter className="flex justify-between">
                <Link
                  isExternal
                  showAnchorIcon
                  href={article.link}
                  onClick={handleLinkClick}
                >
                  Visit article
                </Link>
                <Button
                  color="primary"
                  variant="light"
                  size="sm"
                  onClick={(e) => handleShowMore(e, index)}
                >
                  Show More
                </Button>
              </CardFooter>
            </Card>
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

      <Modal
        isOpen={expandedId !== null}
        onClose={closeArticle}
        size="2xl"
        scrollBehavior="inside"
        backdrop="opaque"
        className="fixed inset-0 flex items-start justify-center z-50 mt-20"
      >
        <div className="fixed inset-0 bg-black/50" />
        <ModalContent className="max-h-[80vh] w-[90vw] max-w-4xl mx-auto bg-white dark:bg-gray-800 relative">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b">
                {expandedId !== null && articles[expandedId].title}
              </ModalHeader>
              <ModalBody className="overflow-y-auto">
                <p className="whitespace-pre-line">
                  {expandedId !== null && articles[expandedId].content}
                </p>
              </ModalBody>
              <ModalFooter className="border-t">
                <Button
                  color="primary"
                  variant="light"
                  onPress={onClose}
                >
                  Close
                </Button>
                <Link
                  isExternal
                  showAnchorIcon
                  href={expandedId !== null ? articles[expandedId].link : ''}
                >
                  Visit article
                </Link>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
