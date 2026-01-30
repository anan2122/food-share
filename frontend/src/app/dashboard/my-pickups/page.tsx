'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Truck,
  AlertCircle,
  Navigation,
  Phone,
  Package,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';
import { Card, Button, Badge, Toggle, Modal } from '@/components/ui';

// Mock data for assigned pickups
const assignedPickups = [
  {
    id: '1',
    foodName: 'Vegetable Biryani',
    quantity: 50,
    unit: 'servings',
    status: 'pickup_pending',
    priority: 'high',
    donor: {
      name: 'Grand Hotel',
      address: '123 MG Road, Bangalore',
      phone: '+91 98765 43210',
      contactPerson: 'Mr. Sharma',
    },
    recipient: {
      name: 'Hope Foundation',
      address: '456 Church Street, Bangalore',
      phone: '+91 87654 32109',
      contactPerson: 'Mrs. Priya',
    },
    estimatedPickupTime: '2024-01-15T14:00:00',
    estimatedDeliveryTime: '2024-01-15T15:00:00',
    distance: {
      toPickup: 2.5,
      toDelivery: 3.2,
      total: 5.7,
    },
    specialInstructions: 'Use service entrance at the back',
    foodType: 'cooked',
    storageCondition: 'hot',
  },
  {
    id: '2',
    foodName: 'Fresh Bread & Pastries',
    quantity: 40,
    unit: 'pieces',
    status: 'in_transit',
    priority: 'critical',
    donor: {
      name: 'City Bakery',
      address: '45 Park Street, Bangalore',
      phone: '+91 98765 11111',
      contactPerson: 'Mr. John',
    },
    recipient: {
      name: 'Children\'s Home',
      address: '789 Residency Road, Bangalore',
      phone: '+91 87654 22222',
      contactPerson: 'Sister Mary',
    },
    estimatedPickupTime: '2024-01-15T13:00:00',
    estimatedDeliveryTime: '2024-01-15T13:45:00',
    pickedUpAt: '2024-01-15T13:05:00',
    distance: {
      toPickup: 1.2,
      toDelivery: 2.8,
      total: 4.0,
    },
    foodType: 'bakery',
    storageCondition: 'room_temperature',
  },
];

const completedToday = [
  {
    id: '3',
    foodName: 'Dal Makhani & Roti',
    quantity: 80,
    unit: 'servings',
    donor: 'Spice Kitchen',
    recipient: 'Old Age Home',
    completedAt: '2024-01-15T12:00:00',
    distance: 6.5,
  },
];

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' }> = {
  assigned: { label: 'Assigned', variant: 'info' },
  pickup_pending: { label: 'Ready for Pickup', variant: 'warning' },
  picked_up: { label: 'Picked Up', variant: 'info' },
  in_transit: { label: 'In Transit', variant: 'info' },
  delivered: { label: 'Delivered', variant: 'success' },
};

const priorityConfig: Record<string, { label: string; variant: 'danger' | 'warning' | 'info' }> = {
  critical: { label: 'Critical', variant: 'danger' },
  high: { label: 'High', variant: 'warning' },
  normal: { label: 'Normal', variant: 'info' },
};

export default function MyPickupsPage() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedPickup, setSelectedPickup] = useState<typeof assignedPickups[0] | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{ type: 'pickup' | 'delivery'; pickup: typeof assignedPickups[0] } | null>(null);

  const activePickups = assignedPickups.filter(p => p.status !== 'delivered');
  const currentlyInTransit = assignedPickups.find(p => p.status === 'in_transit');

  const handleStatusUpdate = (type: 'pickup' | 'delivery') => {
    // In real app, this would call the API
    console.log(`Confirmed ${type}`);
    setShowConfirmModal(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Pickups</h1>
          <p className="text-gray-600 mt-1">Manage your assigned food pickups and deliveries</p>
        </div>
        
        {/* Availability Toggle */}
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
          <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="font-medium text-gray-700">
            {isAvailable ? 'Available for Pickups' : 'Not Available'}
          </span>
          <Toggle checked={isAvailable} onChange={setIsAvailable} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Pickups', value: activePickups.length, icon: Package, color: 'text-blue-600' },
          { label: 'In Transit', value: currentlyInTransit ? 1 : 0, icon: Truck, color: 'text-amber-600' },
          { label: 'Completed Today', value: completedToday.length, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Total Distance', value: `${(completedToday.reduce((sum, p) => sum + p.distance, 0)).toFixed(1)} km`, icon: Navigation, color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <stat.icon className={stat.color} size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Currently In Transit Alert */}
      {currentlyInTransit && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4">
          <Truck className="text-amber-600 flex-shrink-0" size={24} />
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">Currently Delivering: {currentlyInTransit.foodName}</h3>
            <p className="text-sm text-amber-700 mt-1">
              To: {currentlyInTransit.recipient.name} • {currentlyInTransit.distance.toDelivery} km away
            </p>
          </div>
          <Button size="sm" leftIcon={<Navigation size={14} />} onClick={() => setSelectedPickup(currentlyInTransit)}>
            Navigate
          </Button>
        </div>
      )}

      {/* Active Pickups */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Pickups</h2>
        <div className="space-y-4">
          {activePickups.length === 0 ? (
            <Card className="text-center py-12">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No active pickups assigned</p>
              <p className="text-sm text-gray-400 mt-1">
                {isAvailable ? 'New pickups will appear here when assigned' : 'Set yourself as available to receive pickups'}
              </p>
            </Card>
          ) : (
            activePickups.map((pickup) => {
              const status = statusConfig[pickup.status] || statusConfig.assigned;
              const priority = priorityConfig[pickup.priority] || priorityConfig.normal;

              return (
                <Card key={pickup.id} className="relative overflow-hidden">
                  {/* Priority Stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    pickup.priority === 'critical' ? 'bg-red-500' : 
                    pickup.priority === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  
                  <div className="pl-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={priority.variant} size="sm">{priority.label}</Badge>
                          <Badge variant={status.variant} size="sm">{status.label}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900">{pickup.foodName}</h3>
                        <p className="text-sm text-gray-500">{pickup.quantity} {pickup.unit}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedPickup(pickup)}
                      >
                        Details <ChevronRight size={16} />
                      </Button>
                    </div>

                    {/* Route Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Pickup Location */}
                      <div className={`p-3 rounded-lg border ${
                        pickup.status === 'pickup_pending' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">P</div>
                          <span className="text-sm font-medium text-gray-700">Pickup</span>
                          {pickup.status === 'pickup_pending' && (
                            <Badge variant="warning" size="sm">Next</Badge>
                          )}
                        </div>
                        <p className="font-medium text-gray-900">{pickup.donor.name}</p>
                        <p className="text-sm text-gray-600">{pickup.donor.address}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Clock size={14} />
                          {new Date(pickup.estimatedPickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span>•</span>
                          <Navigation size={14} />
                          {pickup.distance.toPickup} km
                        </div>
                      </div>

                      {/* Delivery Location */}
                      <div className={`p-3 rounded-lg border ${
                        pickup.status === 'in_transit' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">D</div>
                          <span className="text-sm font-medium text-gray-700">Delivery</span>
                          {pickup.status === 'in_transit' && (
                            <Badge variant="info" size="sm">Next</Badge>
                          )}
                        </div>
                        <p className="font-medium text-gray-900">{pickup.recipient.name}</p>
                        <p className="text-sm text-gray-600">{pickup.recipient.address}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Clock size={14} />
                          {new Date(pickup.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span>•</span>
                          <Navigation size={14} />
                          {pickup.distance.toDelivery} km
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {pickup.status === 'pickup_pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            leftIcon={<Navigation size={16} />}
                          >
                            Navigate to Pickup
                          </Button>
                          <Button 
                            className="flex-1"
                            leftIcon={<CheckCircle2 size={16} />}
                            onClick={() => setShowConfirmModal({ type: 'pickup', pickup })}
                          >
                            Confirm Pickup
                          </Button>
                        </>
                      )}
                      {pickup.status === 'in_transit' && (
                        <>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            leftIcon={<Navigation size={16} />}
                          >
                            Navigate to Delivery
                          </Button>
                          <Button 
                            className="flex-1"
                            leftIcon={<CheckCircle2 size={16} />}
                            onClick={() => setShowConfirmModal({ type: 'delivery', pickup })}
                          >
                            Confirm Delivery
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Completed Today */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Today</h2>
        <div className="space-y-3">
          {completedToday.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-500">No deliveries completed today</p>
            </Card>
          ) : (
            completedToday.map((delivery) => (
              <Card key={delivery.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{delivery.foodName}</h3>
                      <p className="text-sm text-gray-500">
                        {delivery.donor} → {delivery.recipient}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{delivery.quantity} {delivery.unit}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(delivery.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedPickup}
        onClose={() => setSelectedPickup(null)}
        title="Pickup Details"
        size="lg"
      >
        {selectedPickup && (
          <div className="space-y-6">
            {/* Food Info */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-1">{selectedPickup.foodName}</h3>
              <p className="text-gray-600">{selectedPickup.quantity} {selectedPickup.unit}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant={statusConfig[selectedPickup.status]?.variant || 'info'}>
                  {statusConfig[selectedPickup.status]?.label}
                </Badge>
                <Badge variant={priorityConfig[selectedPickup.priority]?.variant || 'info'}>
                  {priorityConfig[selectedPickup.priority]?.label}
                </Badge>
              </div>
            </div>

            {/* Storage Instructions */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-medium text-amber-800">Storage: {selectedPickup.storageCondition.replace('_', ' ')}</p>
                  <p className="text-sm text-amber-700">
                    {selectedPickup.storageCondition === 'hot' && 'Keep food warm during transit'}
                    {selectedPickup.storageCondition === 'refrigerated' && 'Use insulated container with ice packs'}
                    {selectedPickup.storageCondition === 'room_temperature' && 'Store in clean, dry container'}
                  </p>
                </div>
              </div>
            </div>

            {/* Donor Contact */}
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-3">Pickup Location</h4>
              <div className="space-y-2">
                <p className="font-medium">{selectedPickup.donor.name}</p>
                <p className="text-sm text-gray-600">{selectedPickup.donor.address}</p>
                <p className="text-sm text-gray-600">Contact: {selectedPickup.donor.contactPerson}</p>
                <Button variant="outline" size="sm" leftIcon={<Phone size={14} />}>
                  {selectedPickup.donor.phone}
                </Button>
              </div>
              {selectedPickup.specialInstructions && (
                <p className="mt-3 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                  📝 {selectedPickup.specialInstructions}
                </p>
              )}
            </div>

            {/* Recipient Contact */}
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-3">Delivery Location</h4>
              <div className="space-y-2">
                <p className="font-medium">{selectedPickup.recipient.name}</p>
                <p className="text-sm text-gray-600">{selectedPickup.recipient.address}</p>
                <p className="text-sm text-gray-600">Contact: {selectedPickup.recipient.contactPerson}</p>
                <Button variant="outline" size="sm" leftIcon={<Phone size={14} />}>
                  {selectedPickup.recipient.phone}
                </Button>
              </div>
            </div>

            {/* Route Summary */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-medium text-blue-900 mb-2">Route Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-700">{selectedPickup.distance.toPickup} km</p>
                  <p className="text-xs text-blue-600">To Pickup</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-700">{selectedPickup.distance.toDelivery} km</p>
                  <p className="text-xs text-blue-600">To Delivery</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-700">{selectedPickup.distance.total} km</p>
                  <p className="text-xs text-blue-600">Total</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <Button className="w-full" onClick={() => setSelectedPickup(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!showConfirmModal}
        onClose={() => setShowConfirmModal(null)}
        title={showConfirmModal?.type === 'pickup' ? 'Confirm Pickup' : 'Confirm Delivery'}
      >
        {showConfirmModal && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                showConfirmModal.type === 'pickup' ? 'bg-emerald-100' : 'bg-blue-100'
              }`}>
                {showConfirmModal.type === 'pickup' ? (
                  <Package className="text-emerald-600" size={32} />
                ) : (
                  <CheckCircle2 className="text-blue-600" size={32} />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {showConfirmModal.type === 'pickup' 
                  ? 'Have you collected the food?' 
                  : 'Have you delivered the food?'}
              </h3>
              <p className="text-gray-600">{showConfirmModal.pickup.foodName}</p>
              <p className="text-sm text-gray-500">{showConfirmModal.pickup.quantity} {showConfirmModal.pickup.unit}</p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowConfirmModal(null)}
              >
                Not Yet
              </Button>
              <Button 
                className="flex-1"
                onClick={() => handleStatusUpdate(showConfirmModal.type)}
              >
                Yes, Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
