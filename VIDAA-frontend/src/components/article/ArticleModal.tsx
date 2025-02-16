import { Button, Link, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { ArticleModalProps } from '../../types/article';

export function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  if (!article) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
              {article.title}
            </ModalHeader>
            <ModalBody className="overflow-y-auto">
              <p className="whitespace-pre-line">
                {article.content}
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
                href={article.link}
              >
                Visit article
              </Link>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
