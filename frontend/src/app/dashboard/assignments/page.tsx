'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Search, 
  MapPin, 
  Clock,
  Calendar,
  CheckCircle2,
  Hand,
  AlertCircle,
  ArrowRight,
  Building2,
  User,
  Filter
} from 'lucide-react';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  foodType: string;
  quantity: number;
  status: string;
  expiryTime: string;
  pickupTimeStart: string;
  pickupTimeEnd: string;
  donor: {
    _id: string;
    name: string;
    phone: string;
  };
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  receivedBy?: {
    _id: string;
    name: string;
    organizationName: string;
    address?: {
      city: string;
    };
  };
  distance?: number;
  createdAt: string;
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableAssignments();
  }, [foodTypeFilter]);

  const fetchAvailableAssignments = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { status: 'available' };
      if (foodTypeFilter !== 'all') params.foodType = foodTypeFilter;
      
      const response = await apiClient.getDonations(params);
      if (response.success) {
        // Add mock distance for demo
        const withDistance = (response.data || []).map((d: any) => ({
          ...d,
          distance: Math.random() * 15 + 0.5,
        }));
        
        // Sort by distance or urgency
        const sorted = withDistance.sort((a: any, b: any) => {
          const aHours = (new Date(a.expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
          const bHours = (new Date(b.expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
          return aHours - bHours; // Sort by urgency
        });
        
        setAssignments(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async (id: string) => {
    try {
      setAssigning(id);
      await apiClient.updateDonationStatus(id, 'assigned');
      // Also assign the current user as volunteer
      // This would typically be a separate API call
      fetchAvailableAssignments();
    } catch (error) {
      console.error('Failed to accept assignment:', error);
    } finally {
      setAssigning(null);
    }
  };

  const getUrgency = (expiryTime: string) => {
    const hours = (new Date(expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hours < 2) return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300' };
    if (hours < 6) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-300' };
    if (hours < 12) return { level: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300' };
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.donor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.pickupAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDistance = distanceFilter === 'all' || 
      (distanceFilter === '5' && (assignment.distance || 0) <= 5) ||
      (distanceFilter === '10' && (assignment.distance || 0) <= 10) ||
      (distanceFilter === '15' && (assignment.distance || 0) <= 15);
    
    return matchesSearch && matchesDistance;
  });

  const stats = {
    available: assignments.length,
    urgent: assignments.filter(a => {
      const hours = (new Date(a.expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
      return hours < 6;
    }).length,
    nearby: assignments.filter(a => (a.distance || 0) <= 5).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Available Assignments</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and accept pickup assignments in your area
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{stats.available}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Urgent (&lt;6hrs)</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.nearby}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Nearby (&lt;5km)</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by location, donor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={foodTypeFilter}
            onChange={(e) => setFoodTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'cooked', label: 'Cooked Meals' },
              { value: 'raw', label: 'Raw Ingredients' },
              { value: 'packaged', label: 'Packaged Food' },
              { value: 'perishable', label: 'Perishable' },
            ]}
          />
          <Select
            value={distanceFilter}
            onChange={(e) => setDistanceFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Any Distance' },
              { value: '5', label: 'Within 5km' },
              { value: '10', label: 'Within 10km' },
              { value: '15', label: 'Within 15km' },
            ]}
          />
        </div>
      </Card>

      {/* Assignments Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Assignments Available</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back later for new pickup opportunities in your area.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAssignments.map((assignment) => {
            const urgency = getUrgency(assignment.expiryTime);
            const hoursLeft = Math.max(0, (new Date(assignment.expiryTime).getTime() - Date.now()) / (1000 * 60 * 60));
            
            return (
              <Card 
                key={assignment._id} 
                className={`border-l-4 ${urgency.border}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {assignment.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{assignment.description}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${urgency.bg} ${urgency.color}`}>
                    {urgency.level}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Package size={14} className="text-emerald-600" />
                    <span>{assignment.quantity} servings</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin size={14} className="text-blue-600" />
                    <span>{assignment.distance?.toFixed(1)}km away</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock size={14} className="text-amber-600" />
                    <span>{hoursLeft.toFixed(1)}h left</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 capitalize">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                      {assignment.foodType}
                    </span>
                  </div>
                </div>

                {/* Route Preview */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">{assignment.pickupAddress?.city}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-4 truncate">{assignment.pickupAddress?.street}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {assignment.receivedBy?.address?.city || 'TBD'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 ml-4 truncate">
                        {assignment.receivedBy?.organizationName || 'Awaiting NGO match'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Donor Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <User size={14} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {assignment.donor?.name}
                      </p>
                      <p className="text-xs text-gray-500">Donor</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>Pickup: {assignment.pickupTimeStart} - {assignment.pickupTimeEnd}</p>
                  </div>
                </div>

                {/* Actions */}
                <Button 
                  className="w-full"
                  onClick={() => handleAcceptAssignment(assignment._id)}
                  disabled={assigning === assignment._id}
                >
                  {assigning === assignment._id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Hand size={14} className="mr-2" />
                  )}
                  Accept Assignment
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
