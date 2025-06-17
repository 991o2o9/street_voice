import { Report, AnalysisResult } from '../types';

export interface Solution {
  id: string;
  title: string;
  description: string;
  steps: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: string;
  cost: 'free' | 'low' | 'medium' | 'high';
  responsible: string[];
  resources: string[];
}

export class AISolutionGenerator {
  private solutionTemplates = {
    Housing: {
      'heating issue': {
        title: 'Heating System Repair',
        description: 'Address heating problems in residential buildings',
        steps: [
          'Contact building management or landlord immediately',
          'Document the issue with photos and temperature readings',
          'Check if other units are affected',
          'Contact local housing authority if landlord is unresponsive',
          'Consider temporary heating solutions for safety'
        ],
        priority: 'high' as const,
        estimatedTime: '1-3 days',
        cost: 'medium' as const,
        responsible: ['Building Management', 'HVAC Technician', 'Housing Authority'],
        resources: ['Tenant Rights Guide', 'Emergency Heating Assistance', 'HVAC Repair Services']
      },
      'water problem': {
        title: 'Water System Maintenance',
        description: 'Resolve water supply and quality issues',
        steps: [
          'Report to water utility company immediately',
          'Document water quality issues with photos/samples',
          'Check with neighbors about similar problems',
          'Contact health department for water quality concerns',
          'Arrange temporary water supply if needed'
        ],
        priority: 'critical' as const,
        estimatedTime: '4-24 hours',
        cost: 'low' as const,
        responsible: ['Water Utility', 'Health Department', 'Building Management'],
        resources: ['Water Quality Testing', 'Emergency Water Supply', 'Utility Contact Info']
      }
    },
    Roads: {
      'pothole': {
        title: 'Road Surface Repair',
        description: 'Fix dangerous potholes and road damage',
        steps: [
          'Report to city transportation department',
          'Document location with GPS coordinates',
          'Take photos showing size and severity',
          'Submit online complaint or call hotline',
          'Follow up if not addressed within reasonable time'
        ],
        priority: 'medium' as const,
        estimatedTime: '1-2 weeks',
        cost: 'medium' as const,
        responsible: ['City Transportation', 'Road Maintenance Crew'],
        resources: ['City Complaint Portal', 'Transportation Department Contact', 'Road Repair Timeline']
      },
      'traffic jam': {
        title: 'Traffic Flow Optimization',
        description: 'Improve traffic management and reduce congestion',
        steps: [
          'Analyze traffic patterns and peak hours',
          'Report to traffic management authority',
          'Suggest alternative routes to commuters',
          'Propose traffic signal timing adjustments',
          'Consider public transportation alternatives'
        ],
        priority: 'medium' as const,
        estimatedTime: '2-4 weeks',
        cost: 'high' as const,
        responsible: ['Traffic Management', 'City Planning', 'Transportation Authority'],
        resources: ['Traffic Analysis Tools', 'Public Transit Info', 'Alternative Route Maps']
      }
    },
    Transport: {
      'bus delay': {
        title: 'Public Transit Improvement',
        description: 'Address delays and improve service reliability',
        steps: [
          'Report delays to transit authority',
          'Document patterns of delays with times/dates',
          'Check for service alerts and updates',
          'Suggest schedule adjustments based on data',
          'Advocate for additional buses during peak hours'
        ],
        priority: 'medium' as const,
        estimatedTime: '2-6 weeks',
        cost: 'high' as const,
        responsible: ['Transit Authority', 'Route Planners', 'Operations Management'],
        resources: ['Transit App', 'Service Alerts', 'Customer Service Contact']
      }
    },
    Safety: {
      'crime': {
        title: 'Community Safety Enhancement',
        description: 'Improve neighborhood security and safety measures',
        steps: [
          'Report incidents to police immediately',
          'Contact community policing officer',
          'Organize neighborhood watch program',
          'Improve lighting in problem areas',
          'Install security cameras if appropriate'
        ],
        priority: 'high' as const,
        estimatedTime: '1-8 weeks',
        cost: 'medium' as const,
        responsible: ['Police Department', 'Community Leaders', 'City Council'],
        resources: ['Police Non-Emergency Line', 'Community Safety Programs', 'Neighborhood Watch Guide']
      }
    },
    Environment: {
      'pollution': {
        title: 'Environmental Cleanup Initiative',
        description: 'Address pollution and environmental health concerns',
        steps: [
          'Report to environmental protection agency',
          'Document pollution sources with evidence',
          'Contact local health department',
          'Organize community cleanup events',
          'Advocate for stricter environmental regulations'
        ],
        priority: 'high' as const,
        estimatedTime: '2-12 weeks',
        cost: 'medium' as const,
        responsible: ['EPA', 'Health Department', 'Environmental Groups'],
        resources: ['Pollution Reporting Portal', 'Environmental Testing', 'Community Action Groups']
      }
    }
  };

  generateSolution(report: Report): Solution {
    const category = report.category || 'Other';
    const text = report.text.toLowerCase();
    
    // Find matching solution template
    const categoryTemplates = this.solutionTemplates[category as keyof typeof this.solutionTemplates];
    
    if (categoryTemplates) {
      // Find best matching template based on keywords
      const matchingTemplate = Object.entries(categoryTemplates).find(([key]) => 
        text.includes(key) || key.split(' ').some(word => text.includes(word))
      );
      
      if (matchingTemplate) {
        const [, template] = matchingTemplate;
        return {
          id: `solution_${report.id}`,
          ...template,
          title: `${template.title} - ${report.district}`,
          description: `${template.description} in ${report.location}`,
        };
      }
    }
    
    // Default generic solution
    return this.generateGenericSolution(report);
  }

  private generateGenericSolution(report: Report): Solution {
    return {
      id: `solution_${report.id}`,
      title: `Address Issue in ${report.district}`,
      description: `General solution approach for reported problem in ${report.location}`,
      steps: [
        'Document the issue with photos and detailed description',
        'Contact relevant city department or authority',
        'Submit formal complaint through official channels',
        'Follow up regularly on progress',
        'Engage community support if needed'
      ],
      priority: report.severity && report.severity > 7 ? 'high' : 'medium',
      estimatedTime: '1-4 weeks',
      cost: 'medium' as const,
      responsible: ['City Administration', 'Local Representatives'],
      resources: ['City Complaint Portal', 'Local Government Contacts', 'Community Resources']
    };
  }

  generateBatchSolutions(reports: Report[]): Solution[] {
    return reports
      .filter(report => report.analyzed && report.category)
      .map(report => this.generateSolution(report));
  }

  // Analyze patterns and suggest city-wide improvements
  generateCityWideSolutions(reports: Report[]): Solution[] {
    const categoryStats: Record<string, number> = {};
    const districtStats: Record<string, number> = {};
    
    reports.forEach(report => {
      if (report.category) {
        categoryStats[report.category] = (categoryStats[report.category] || 0) + 1;
      }
      districtStats[report.district] = (districtStats[report.district] || 0) + 1;
    });

    const solutions: Solution[] = [];

    // Most problematic category
    const topCategory = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory && topCategory[1] > 5) {
      solutions.push({
        id: 'citywide_category',
        title: `City-Wide ${topCategory[0]} Improvement Initiative`,
        description: `Comprehensive plan to address ${topCategory[0].toLowerCase()} issues across the city`,
        steps: [
          `Conduct city-wide audit of ${topCategory[0].toLowerCase()} infrastructure`,
          'Allocate emergency budget for immediate fixes',
          'Develop long-term improvement plan',
          'Establish regular maintenance schedule',
          'Create citizen reporting system'
        ],
        priority: 'high' as const,
        estimatedTime: '3-6 months',
        cost: 'high' as const,
        responsible: ['City Council', 'Department Heads', 'Budget Committee'],
        resources: ['City Budget', 'Infrastructure Assessment', 'Citizen Engagement Platform']
      });
    }

    // Most problematic district
    const topDistrict = Object.entries(districtStats)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topDistrict && topDistrict[1] > 3) {
      solutions.push({
        id: 'district_focus',
        title: `${topDistrict[0]} District Revitalization Program`,
        description: `Focused improvement program for ${topDistrict[0]} district`,
        steps: [
          'Establish district task force',
          'Conduct community needs assessment',
          'Prioritize most critical issues',
          'Implement quick wins for immediate impact',
          'Develop long-term district improvement plan'
        ],
        priority: 'high' as const,
        estimatedTime: '2-4 months',
        cost: 'high' as const,
        responsible: ['District Council', 'Community Leaders', 'City Planning'],
        resources: ['Community Engagement', 'District Budget', 'Planning Resources']
      });
    }

    return solutions;
  }
}

export const aiSolutionGenerator = new AISolutionGenerator();