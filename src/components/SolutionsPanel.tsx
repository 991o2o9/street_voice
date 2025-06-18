import React, { useState, useEffect } from 'react';
import { Lightbulb, Clock, DollarSign, Users, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Phone, Mail, Globe, MapPin } from 'lucide-react';
import { Report } from '../types';
import { Solution, aiSolutionGenerator } from '../utils/aiSolutions';

interface SolutionsPanelProps {
  reports: Report[];
}

export default function SolutionsPanel({ reports }: SolutionsPanelProps) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [cityWideSolutions, setCityWideSolutions] = useState<Solution[]>([]);
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (reports.length > 0) {
      generateSolutions();
    }
  }, [reports]);

  const generateSolutions = async () => {
    setIsGenerating(true);
    try {
      // Generate individual solutions
      const individualSolutions = aiSolutionGenerator.generateBatchSolutions(reports);
      setSolutions(individualSolutions);

      // Generate city-wide solutions
      const cityWide = aiSolutionGenerator.generateCityWideSolutions(reports);
      setCityWideSolutions(cityWide);
    } catch (error) {
      console.error('Error generating solutions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSolution = (solutionId: string) => {
    const newExpanded = new Set(expandedSolutions);
    if (newExpanded.has(solutionId)) {
      newExpanded.delete(solutionId);
    } else {
      newExpanded.add(solutionId);
    }
    setExpandedSolutions(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'free': return 'text-green-600 dark:text-green-400';
      case 'low': return 'text-blue-600 dark:text-blue-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getContactInfo = (responsible: string[]) => {
    const contacts: Record<string, { phone?: string; email?: string; website?: string }> = {
      'City Administration': {
        phone: '311',
        email: 'info@city.gov',
        website: 'city.gov'
      },
      'Police Department': {
        phone: '911 (Emergency) / 311 (Non-emergency)',
        email: 'police@city.gov'
      },
      'Transportation Authority': {
        phone: '311',
        email: 'transport@city.gov'
      },
      'Water Utility': {
        phone: '1-800-WATER',
        email: 'water@utility.com'
      },
      'Building Management': {
        phone: 'Contact your building manager',
        email: 'management@building.com'
      }
    };

    return responsible.map(party => contacts[party] || {}).filter(contact => 
      contact.phone || contact.email || contact.website
    );
  };

  const SolutionCard = ({ solution }: { solution: Solution }) => {
    const isExpanded = expandedSolutions.has(solution.id);
    const contactInfo = getContactInfo(solution.responsible);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => toggleSolution(solution.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{solution.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{solution.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(solution.priority)}`}>
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {solution.priority.toUpperCase()}
                </span>
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{solution.estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <DollarSign className="w-3 h-3" />
                  <span className={getCostColor(solution.cost)}>{solution.cost}</span>
                </div>
              </div>
            </div>
            
            <div className="ml-4">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
            <div className="mt-4 space-y-6">
              {/* Action Steps */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Action Steps
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 ml-6">
                  {solution.steps.map((step, index) => (
                    <li key={index} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Responsible Parties */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  Responsible Parties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {solution.responsible.map((party, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                      {party}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              {contactInfo.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-green-500" />
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    {contactInfo.map((contact, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          {contact.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300">{contact.phone}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300">{contact.email}</span>
                            </div>
                          )}
                          {contact.website && (
                            <div className="flex items-center space-x-2">
                              <Globe className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                              <span className="text-blue-600 dark:text-blue-400">{contact.website}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                  Required Resources
                </h4>
                <div className="flex flex-wrap gap-2">
                  {solution.resources.map((resource, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-sm rounded-full">
                      {resource}
                    </span>
                  ))}
                </div>
              </div>

              {/* Success Metrics */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Expected Outcomes</h4>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                    <li>• Problem resolution within estimated timeframe</li>
                    <li>• Improved citizen satisfaction</li>
                    <li>• Prevention of similar issues</li>
                    <li>• Enhanced community engagement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (reports.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="text-center">
          <Lightbulb className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Load and analyze data to see AI-generated solutions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Solutions</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {solutions.length} individual solutions • {cityWideSolutions.length} city-wide initiatives
              </p>
            </div>
          </div>
          
          <button
            onClick={generateSolutions}
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                <span>Regenerate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* City-Wide Solutions */}
      {cityWideSolutions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">City-Wide Initiatives</h3>
          <div className="space-y-4">
            {cityWideSolutions.map((solution) => (
              <SolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        </div>
      )}

      {/* Individual Solutions */}
      {solutions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Individual Solutions</h3>
          <div className="space-y-4">
            {solutions.slice(0, 10).map((solution) => (
              <SolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
          
          {solutions.length > 10 && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing 10 of {solutions.length} solutions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}