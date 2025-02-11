export function ComingSoonPage({
    title = "Feature Coming Soon",
    description = "We're working hard to bring you something amazing. Stay tuned!"
  }: {
    title?: string;
    description?: string;
  }) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8 relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {title}
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            {description}
          </p>

          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-blue-500 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    )
  }
