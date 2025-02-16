import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Link } from '@heroui/react';
import { ArticleCardProps } from '../../types/article';

export function ArticleCard({ article, isSelected, onSelect, onShowMore }: ArticleCardProps) {
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className={`max-w-[400px] border-2 rounded-2xl overflow-hidden shadow-xl
        ${isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 group-hover:border-blue-300 group-hover:shadow-2xl group-hover:-translate-y-1'
        } transition-all duration-200`}
      shadow="none"
      onPress={() => onSelect(article)}
    >
      <CardHeader className="flex gap-3 h-[80px]">
        <div className="flex flex-col flex-grow">
          <p className="text-md font-medium line-clamp-2">{article.title}</p>
          <p className="text-small text-default-500 mt-1">
            {new URL(article.link).hostname}
          </p>
        </div>
        {isSelected && (
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
          {article.content.length > 300
            ? `${article.content.substring(0, 300).trim()}...`
            : article.content}
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
          onClick={(e) => {
            e.stopPropagation();
            onShowMore();
          }}
        >
          Show More
        </Button>
      </CardFooter>
    </Card>
  );
}
