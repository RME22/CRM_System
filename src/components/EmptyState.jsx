import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionLink,
  actionOnClick 
}) => {
  return (
    <div className="card text-center py-16">
      <div className="flex flex-col items-center space-y-4">
        {Icon && (
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Icon size={32} className="text-gray-400" />
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 max-w-md mx-auto">{description}</p>
        </div>
        {(actionLabel && (actionLink || actionOnClick)) && (
          <div className="mt-4">
            {actionLink ? (
              <Link to={actionLink} className="btn btn-primary">
                {actionLabel}
              </Link>
            ) : (
              <button onClick={actionOnClick} className="btn btn-primary">
                {actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
