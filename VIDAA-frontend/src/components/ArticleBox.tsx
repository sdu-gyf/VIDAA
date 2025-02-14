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
}

export function ArticleBox({ articles, loading }: ArticleBoxProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const openArticle = (index: number) => {
    setExpandedId(index);
  };

  const closeArticle = () => {
    setExpandedId(null);
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
          <Card
            key={index}
            className="max-w-[400px] border-2 border-gray-200 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
            shadow="none"
          >
            <CardHeader className="flex gap-3 h-[80px]">
              <div className="flex flex-col">
                <p className="text-md font-medium line-clamp-2">{article.title}</p>
                <p className="text-small text-default-500 mt-1">
                  {new URL(article.link).hostname}
                </p>
              </div>
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
              >
                Visit article
              </Link>
              <Button
                color="primary"
                variant="light"
                size="sm"
                onPress={() => openArticle(index)}
              >
                Show More
              </Button>
            </CardFooter>
          </Card>
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
        backdrop="blur"
        className="bg-white dark:bg-gray-800"
      >
        <ModalContent className="bg-white dark:bg-gray-800">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b">
                {expandedId !== null && articles[expandedId].title}
              </ModalHeader>
              <ModalBody className="bg-white dark:bg-gray-800">
                <p className="whitespace-pre-line text-gray-800 dark:text-gray-200">
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
