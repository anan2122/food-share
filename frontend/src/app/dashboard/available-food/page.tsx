'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  AlertTriangle,
  Filter,
  Search,
  Heart,
  Truck,
  Info,
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '@/components/ui';

interface AvailableFood {
  _id: string;
  title: string;
  description?: string;
  quantity: number;
  unit?: string;
  foodType?: string;
  donor?: {
    name: string;
    organizationName?: string;
  };
  createdAt: string;
  expiryDate?: string;
  pickupAddress?: string;
  isVegetarian?: boolean;
  allergens?: string[];
  status: string;
}

const foodTypeOptions = [
  { value: '', label: 'All Food Types' },
  { value: 'cooked', label: 'Cooked Food' },
  { value: 'bakery', label: 'Bakery Items' },
  { value: 'fruits_vegetables', label: 'Fruits & Vegetables' },
  { value: 'packaged', label: 'Packaged Food' },
];

const urgencyConfig: Record<string, { label: string; variant: 'danger' | 'warning' | 'info' | 'success' }> = {
  critical: { label: 'Critical', variant: 'danger' },
  high: { label: 'High Priority', variant: 'warning' },
  medium: { label: 'Medium', variant: 'info' },
  low: { label: 'Low', variant: 'success' },
};

function getUrgencyLevel(expiryDate?: string): string {
  if (!expiryDate) return 'low';
  const now = new Date();
  const expiry = new Date(expiryDate);
  const hoursRemaining = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursRemaining <= 1) return 'critical';
  if (hoursRemaining <= 3) return 'high';
  if (hoursRemaining <= 6) return 'medium';
  return 'low';
}

function getHoursRemaining(expiryDate?: string): number {
  if (!expiryDate) return 24;
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.max(0, Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60)));
}

export default function AvailableFoodPage() {
  const [availableFood, setAvailableFood] = useState<AvailableFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('');
  const [selectedFood, setSelectedFood] = useState<AvailableFood | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    fetchAvailableFood();
  }, []);

  const fetchAvailableFood = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDonations({ status: 'approved' });
      if (response.success && response.data) {
        setAvailableFood(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch available food:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFood = availableFood.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.donor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !foodTypeFilter || f.foodType === foodTypeFilter;
    return matchesSearch && matchesType;
  });

  // Sort by urgency (critical first)
  const sortedFood = [...filteredFood].sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const urgencyA = getUrgencyLevel(a.expiryDate);
    const urgencyB = getUrgencyLevel(b.expiryDate);
    return (urgencyOrder[urgencyA as keyof typeof urgencyOrder] || 4) - 
           (urgencyOrder[urgencyB as keyof typeof urgencyOrder] || 4);
  });

  const handleRequest = async () => {
    if (!selectedFood) return;
    setIsRequesting(true);
    try {
      await apiClient.requestFood(selectedFood._id);
      setRequestSuccess(true);
    } catch (error) {
      console.error('Failed to request food:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Available Food</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Browse and request surplus food from nearby donors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Available Now', value: availableFood.length, icon: UtensilsCrossed, color: 'text-emerald-600' },
          { label: 'Critical (< 1hr)', value: availableFood.filter(f => getUrgencyLevel(f.expiryDate) === 'critical').length, icon: AlertTriangle, color: 'text-red-600' },
          { label: 'High Priority', value: availableFood.filter(f => getUrgencyLevel(f.expiryDate) === 'high').length, icon: Clock, color: 'text-amber-600' },
          { label: 'Total Servings', value: availableFood.reduce((sum, f) => sum + f.quantity, 0), icon: Heart, color: 'text-pink-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <stat.icon className={stat.color} size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search food or donor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <Select
              options={foodTypeOptions}
              value={foodTypeFilter}
              onChange={(e) => setFoodTypeFilter(e.target.value)}
              className="w-44"
            />
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Food Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedFood.length === 0 ? (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <UtensilsCrossed className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 dark:text-gray-400">No food available matching your criteria</p>
              </Card>
            </div>
          ) : (
            sortedFood.map((food) => {
              const urgencyLevel = getUrgencyLevel(food.expiryDate);
              const urgency = urgencyConfig[urgencyLevel] || urgencyConfig.medium;
              const hoursRemaining = getHoursRemaining(food.expiryDate);

              return (
                <Card key={food._id} hover onClick={() => setSelectedFood(food)}>
                  {/* Header with urgency */}
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={urgency.variant}>{urgency.label}</Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{hoursRemaining}h left</span>
                  </div>

                  {/* Food Info */}
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{food.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{food.description || 'No description'}</p>

                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <UtensilsCrossed size={14} />
                      {food.quantity} {food.unit || 'servings'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {hoursRemaining}h left
                    </span>
                  </div>

                  {/* Donor */}
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{food.donor?.organizationName || food.donor?.name || 'Anonymous'}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {food.isVegetarian && <Badge variant="success" size="sm">Veg</Badge>}
                    {food.allergens?.map((a) => (
                      <Badge key={a} variant="warning" size="sm">{a}</Badge>
                    ))}
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end">
                    <Button size="sm" leftIcon={<Heart size={14} />}>Request</Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedFood && !requestSuccess}
        onClose={() => setSelectedFood(null)}
        title="Food Details"
        size="lg"
      >
        {selectedFood && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedFood.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{selectedFood.donor?.organizationName || selectedFood.donor?.name || 'Anonymous'}</p>
              </div>
              <Badge variant={urgencyConfig[getUrgencyLevel(selectedFood.expiryDate)]?.variant || 'info'}>
                {urgencyConfig[getUrgencyLevel(selectedFood.expiryDate)]?.label}
              </Badge>
            </div>

            {/* Time Warning */}
            {getHoursRemaining(selectedFood.expiryDate) <= 3 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Time Sensitive</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Only {getHoursRemaining(selectedFood.expiryDate)} hours remaining. Request quickly to avoid waste.
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
              <p className="text-gray-600 dark:text-gray-400">{selectedFood.description || 'No description provided'}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedFood.quantity} {selectedFood.unit || 'servings'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Food Type</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{(selectedFood.foodType || 'cooked').replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Time Left</p>
                <p className="font-medium text-gray-900 dark:text-white">{getHoursRemaining(selectedFood.expiryDate)} hours</p>
              </div>
            </div>

            {/* Dietary & Allergens */}
            {(selectedFood.isVegetarian || selectedFood.allergens?.length) && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Dietary Information</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFood.isVegetarian && <Badge variant="success">Vegetarian</Badge>}
                  {selectedFood.allergens && selectedFood.allergens.length > 0 && (
                    <>
                      <span className="text-gray-400">|</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Allergens:</span>
                      {selectedFood.allergens.map((a) => (
                        <Badge key={a} variant="warning">{a}</Badge>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Pickup Location */}
            {selectedFood.pickupAddress && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pickup Location</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">{selectedFood.pickupAddress}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedFood(null)}>
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                leftIcon={<Truck size={18} />}
                onClick={handleRequest}
                isLoading={isRequesting}
              >
                Request Pickup
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <Info size={12} />
              A volunteer will be assigned for pickup after confirmation
            </p>
          </div>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={requestSuccess}
        onClose={() => {
          setRequestSuccess(false);
          setSelectedFood(null);
        }}
        title="Request Submitted"
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <Heart className="text-green-600" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Food Request Submitted!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your request has been sent to the donor. A volunteer will be assigned for pickup shortly.
          </p>
          <Button 
            onClick={() => {
              setRequestSuccess(false);
              setSelectedFood(null);
              window.location.href = '/dashboard/my-requests';
            }}
          >
            View My Requests
          </Button>
        </div>
      </Modal>
    </div>
  );
}
