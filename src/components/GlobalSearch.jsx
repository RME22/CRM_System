import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { globalSearch } from '../services/api';

const GlobalSearch = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ projects: [], stakeholders: [], pursuits: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        searchData();
      } else {
        setResults({ projects: [], stakeholders: [], pursuits: [], total: 0 });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchData = async () => {
    setLoading(true);
    try {
      const data = await globalSearch(query);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (type, id) => {
    navigate(`/${type}/${id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[600px] flex flex-col">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, stakeholders, pursuits..."
            className="flex-1 ml-3 outline-none text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {loading && <Loader2 size={20} className="animate-spin text-gray-400" />}
          <button onClick={onClose} className="ml-2 p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {query.length < 2 ? (
            <p className="text-gray-500 text-center py-8">
              Type at least 2 characters to search...
            </p>
          ) : results.total === 0 && !loading ? (
            <p className="text-gray-500 text-center py-8">No results found</p>
          ) : (
            <div className="space-y-6">
              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">PROJECTS</h3>
                  <div className="space-y-2">
                    {results.projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleNavigate('projects', project.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-500">
                          {project.sector} • {project.region} • {project.stage}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stakeholders */}
              {results.stakeholders.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">STAKEHOLDERS</h3>
                  <div className="space-y-2">
                    {results.stakeholders.map((stakeholder) => (
                      <button
                        key={stakeholder.id}
                        onClick={() => handleNavigate('stakeholders', stakeholder.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="font-medium">{stakeholder.name}</div>
                        <div className="text-sm text-gray-500">
                          {stakeholder.stakeholderType} • {stakeholder.primarySector} • {stakeholder.region}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pursuits */}
              {results.pursuits.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">PURSUITS</h3>
                  <div className="space-y-2">
                    {results.pursuits.map((pursuit) => (
                      <button
                        key={pursuit.id}
                        onClick={() => handleNavigate('pursuits', pursuit.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="font-medium">{pursuit.clientName}</div>
                        <div className="text-sm text-gray-500">
                          {pursuit.region} • {pursuit.status} • {pursuit.progressPercent}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
