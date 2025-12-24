const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );

  const TableRowSkeleton = () => (
    <div className="animate-pulse flex items-center space-x-4 py-4 border-b">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="card animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  const skeletonTypes = {
    card: CardSkeleton,
    table: TableRowSkeleton,
    list: ListSkeleton
  };

  const SkeletonComponent = skeletonTypes[type] || CardSkeleton;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </>
  );
};

export default LoadingSkeleton;
