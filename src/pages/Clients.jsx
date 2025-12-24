import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStakeholders } from '../services/api';
import { Search, Plus, MapPin, Building2, Edit2, Users } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const Stakeholders = () => {
  const [stakeholders, setStakeholders] = useState([]);
  const [filteredStakeholders, setFilteredStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [minProjects, setMinProjects] = useState('');
  const [minActivities, setMinActivities] = useState('');

  useEffect(() => {
    loadStakeholders();
  }, []);

  useEffect(() => {
    filterStakeholders();
  }, [stakeholders, searchTerm, selectedRegion, selectedCountry, minProjects, minActivities]);

  const loadStakeholders = async () => {
    try {
      const data = await getStakeholders();
      setStakeholders(data);
    } catch (error) {
      console.error('Failed to load stakeholders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStakeholders = () => {
    let filtered = stakeholders;

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.primarySector.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion) {
      filtered = filtered.filter(s => s.region === selectedRegion);
    }

    if (selectedCountry) {
      filtered = filtered.filter(s => s.country === selectedCountry);
    }

    if (minProjects) {
      filtered = filtered.filter(s => (s._count?.projects || 0) >= parseInt(minProjects));
    }

    if (minActivities) {
      filtered = filtered.filter(s => (s._count?.pursuits || 0) >= parseInt(minActivities));
    }

    setFilteredStakeholders(filtered);
  };

  const getRelationshipTierColor = (tier) => {
    const colors = {
      STRATEGIC: 'bg-purple-100 text-purple-800',
      PREFERRED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      OCCASIONAL: 'bg-yellow-100 text-yellow-800',
      NEW: 'bg-gray-100 text-gray-800'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto animate-fade-in">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="card mb-6">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton type="card" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage client and partner relationships</p>
        </div>
        <Link to="/clients/create" className="btn btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Client</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search clients..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedCountry(''); // Reset country when region changes
            }}
          >
            <option value="">All Regions</option>
            <option value="Middle East">Middle East</option>
            <option value="Europe">Europe</option>
            <option value="North America">North America</option>
            <option value="Asia Pacific">Asia Pacific</option>
            <option value="Africa">Africa</option>
            <option value="Latin America">Latin America</option>
          </select>

          <select
            className="input"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {selectedRegion && [
              ...new Set(
                stakeholders
                  .filter(s => s.region === selectedRegion)
                  .map(s => s.country)
                  .filter(Boolean)
              )
            ].sort().map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
            {!selectedRegion && [
              ...new Set(
                stakeholders
                  .map(s => s.country)
                  .filter(Boolean)
              )
            ].sort().map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Projects"
            className="input"
            value={minProjects}
            onChange={(e) => setMinProjects(e.target.value)}
            min="0"
          />

          <input
            type="number"
            placeholder="Min Activities"
            className="input"
            value={minActivities}
            onChange={(e) => setMinActivities(e.target.value)}
            min="0"
          />
        </div>
      </div>

      {/* Stakeholders Grid */}
      {filteredStakeholders.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchTerm || selectedRegion || selectedCountry || minProjects || minActivities ? 'No clients match your filters' : 'No clients yet'}
          description={searchTerm || selectedRegion || selectedCountry || minProjects || minActivities ? 'Try adjusting your search or filters to find what you\'re looking for.' : 'Start building your network by adding clients, partners, and other contacts.'}
          actionLabel="Add Client"
          actionLink="/clients/create"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStakeholders.map((stakeholder, index) => (
            <div 
              key={stakeholder.id} 
              className="card hover:shadow-lg transition-shadow relative animate-slide-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Edit Button */}
              <Link
                to={`/clients/${stakeholder.id}/edit`}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit2 size={18} />
              </Link>

              {/* Card Content - Clickable */}
              <Link to={`/clients/${stakeholder.id}`} className="block">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pr-8">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 size={24} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg line-clamp-1">{stakeholder.name}</h3>
                      <p className="text-sm text-gray-600">{stakeholder.primarySector}</p>
                    </div>
                  </div>
                </div>

              {/* Type & Tier */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="badge badge-info">{stakeholder.stakeholderType}</span>
                <span className={`badge ${getRelationshipTierColor(stakeholder.relationshipTier)}`}>
                  {stakeholder.relationshipTier}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <MapPin size={16} />
                <span>{stakeholder.region}, {stakeholder.country}</span>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {stakeholder._count?.projects || 0}
                  </p>
                  <p className="text-xs text-gray-600">Projects</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {stakeholder._count?.pursuits || 0}
                  </p>
                  <p className="text-xs text-gray-600">Activities</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {stakeholder._count?.engagements || 0}
                  </p>
                  <p className="text-xs text-gray-600">Engagements</p>
                </div>
              </div>

              {/* Last Engagement */}
              {stakeholder.lastEngagementDate && (
                <div className="mt-3 text-xs text-gray-500">
                  Last contact: {new Date(stakeholder.lastEngagementDate).toLocaleDateString()}
                </div>
              )}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">{stakeholders.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">
            {stakeholders.filter(s => s.stakeholderType === 'CLIENT').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Clients</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {stakeholders.filter(s => s.stakeholderType === 'CONSULTANT').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Consultants</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-purple-600">
            {stakeholders.filter(s => s.relationshipTier === 'STRATEGIC').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Strategic</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {stakeholders.filter(s => s.relationshipTier === 'PREFERRED').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Preferred</p>
        </div>
      </div>
    </div>
  );
};

export default Stakeholders;
