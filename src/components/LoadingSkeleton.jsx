const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="card animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-3"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
        </div>
        <div className="h-7 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-5/6"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/6"></div>
      </div>
    </div>
  );

  const TableRowSkeleton = () => (
    <div className="animate-pulse flex items-center space-x-4 py-4 border-b relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4"></div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4"></div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4"></div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4"></div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="card animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
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
