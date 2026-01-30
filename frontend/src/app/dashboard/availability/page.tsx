'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Bike,
  Car,
  Truck as TruckIcon,
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Toggle, Modal } from '@/components/ui';

const daysOfWeek = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

const vehicleTypes = [
  { value: 'bicycle', label: 'Bicycle', icon: Bike, capacity: 'Up to 5 kg' },
  { value: 'two_wheeler', label: 'Two Wheeler', icon: Bike, capacity: 'Up to 10 kg' },
  { value: 'car', label: 'Car', icon: Car, capacity: 'Up to 50 kg' },
  { value: 'van', label: 'Van', icon: TruckIcon, capacity: 'Up to 200 kg' },
];

// Mock current availability
const initialAvailability = {
  isActive: true,
  vehicleType: 'two_wheeler',
  vehicleNumber: 'KA-01-AB-1234',
  serviceRadius: 10,
  preferredAreas: ['Koramangala', 'Indiranagar', 'HSR Layout'],
  weeklySchedule: {
    monday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '20:00' }] },
    tuesday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }] },
    wednesday: { enabled: false, slots: [] },
    thursday: { enabled: true, slots: [{ start: '14:00', end: '18:00' }] },
    friday: { enabled: true, slots: [{ start: '09:00', end: '21:00' }] },
    saturday: { enabled: true, slots: [{ start: '08:00', end: '14:00' }] },
    sunday: { enabled: false, slots: [] },
  },
};

const areaOptions = [
  'Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 
  'BTM Layout', 'Jayanagar', 'JP Nagar', 'Marathahalli',
  'Electronic City', 'Bannerghatta', 'Bellandur', 'Sarjapur'
];

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState(initialAvailability);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState({ start: '09:00', end: '17:00' });
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialAvailability.preferredAreas);
  const [showAreaModal, setShowAreaModal] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const toggleDay = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day as keyof typeof prev.weeklySchedule],
          enabled: !prev.weeklySchedule[day as keyof typeof prev.weeklySchedule].enabled,
        },
      },
    }));
  };

  const addSlot = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day as keyof typeof prev.weeklySchedule],
          slots: [
            ...prev.weeklySchedule[day as keyof typeof prev.weeklySchedule].slots,
            { ...newSlot },
          ],
        },
      },
    }));
    setNewSlot({ start: '09:00', end: '17:00' });
    setEditingDay(null);
  };

  const removeSlot = (day: string, index: number) => {
    setAvailability((prev) => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day as keyof typeof prev.weeklySchedule],
          slots: prev.weeklySchedule[day as keyof typeof prev.weeklySchedule].slots.filter(
            (_, i) => i !== index
          ),
        },
      },
    }));
  };

  const getTotalHours = () => {
    let total = 0;
    Object.values(availability.weeklySchedule).forEach((day) => {
      if (day.enabled) {
        day.slots.forEach((slot) => {
          const start = parseInt(slot.start.split(':')[0]) + parseInt(slot.start.split(':')[1]) / 60;
          const end = parseInt(slot.end.split(':')[0]) + parseInt(slot.end.split(':')[1]) / 60;
          total += end - start;
        });
      }
    });
    return total.toFixed(1);
  };

  const getActiveDays = () => {
    return Object.values(availability.weeklySchedule).filter((d) => d.enabled).length;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Availability Settings</h1>
          <p className="text-gray-600 mt-1">Manage your schedule and preferences for food pickups</p>
        </div>

        <Button 
          leftIcon={showSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          onClick={handleSave}
          isLoading={isSaving}
          className={showSaved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {showSaved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Days', value: getActiveDays(), icon: Calendar, color: 'text-blue-600' },
          { label: 'Weekly Hours', value: getTotalHours(), icon: Clock, color: 'text-emerald-600' },
          { label: 'Service Radius', value: `${availability.serviceRadius} km`, icon: MapPin, color: 'text-purple-600' },
          { label: 'Preferred Areas', value: selectedAreas.length, icon: MapPin, color: 'text-amber-600' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Availability Status */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Availability Status</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${availability.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="font-medium text-gray-900">
                  {availability.isActive ? 'Available for Pickups' : 'Not Available'}
                </span>
              </div>
              <Toggle
                checked={availability.isActive}
                onChange={(checked) => setAvailability((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
            {!availability.isActive && (
              <p className="text-sm text-amber-600 mt-3 flex items-center gap-1">
                <AlertCircle size={14} />
                You won't receive new pickup assignments while unavailable
              </p>
            )}
          </Card>

          {/* Vehicle Information */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Vehicle Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {vehicleTypes.map((vehicle) => {
                    const Icon = vehicle.icon;
                    const isSelected = availability.vehicleType === vehicle.value;
                    return (
                      <button
                        key={vehicle.value}
                        onClick={() => setAvailability((prev) => ({ ...prev, vehicleType: vehicle.value }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={isSelected ? 'text-emerald-600' : 'text-gray-400'} size={24} />
                        <p className={`font-medium mt-2 ${isSelected ? 'text-emerald-900' : 'text-gray-900'}`}>
                          {vehicle.label}
                        </p>
                        <p className="text-xs text-gray-500">{vehicle.capacity}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input
                label="Vehicle Number"
                value={availability.vehicleNumber}
                onChange={(e) => setAvailability((prev) => ({ ...prev, vehicleNumber: e.target.value }))}
                placeholder="e.g., KA-01-AB-1234"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Radius: {availability.serviceRadius} km
                </label>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={availability.serviceRadius}
                  onChange={(e) => setAvailability((prev) => ({ ...prev, serviceRadius: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 km</span>
                  <span>25 km</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Preferred Areas */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Preferred Areas</h3>
              <Button size="sm" variant="outline" onClick={() => setShowAreaModal(true)}>
                <Plus size={16} className="mr-1" /> Edit Areas
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedAreas.length === 0 ? (
                <p className="text-gray-500 text-sm">No preferred areas selected</p>
              ) : (
                selectedAreas.map((area) => (
                  <Badge key={area} variant="info">
                    {area}
                    <button
                      onClick={() => setSelectedAreas((prev) => prev.filter((a) => a !== area))}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Weekly Schedule */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
          <div className="space-y-4">
            {daysOfWeek.map((day) => {
              const daySchedule = availability.weeklySchedule[day.key as keyof typeof availability.weeklySchedule];
              return (
                <div
                  key={day.key}
                  className={`p-4 rounded-xl border transition-all ${
                    daySchedule.enabled ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Toggle
                        checked={daySchedule.enabled}
                        onChange={() => toggleDay(day.key)}
                        size="sm"
                      />
                      <span className={`font-medium ${daySchedule.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                        {day.label}
                      </span>
                    </div>
                    {daySchedule.enabled && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingDay(editingDay === day.key ? null : day.key)}
                      >
                        <Plus size={14} /> Add Slot
                      </Button>
                    )}
                  </div>

                  {daySchedule.enabled && (
                    <div className="space-y-2">
                      {daySchedule.slots.length === 0 ? (
                        <p className="text-sm text-gray-500">No time slots added</p>
                      ) : (
                        daySchedule.slots.map((slot, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {slot.start} - {slot.end}
                              </span>
                            </div>
                            <button
                              onClick={() => removeSlot(day.key, i)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}

                      {editingDay === day.key && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded-lg border border-emerald-200">
                          <input
                            type="time"
                            value={newSlot.start}
                            onChange={(e) => setNewSlot((prev) => ({ ...prev, start: e.target.value }))}
                            className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={newSlot.end}
                            onChange={(e) => setNewSlot((prev) => ({ ...prev, end: e.target.value }))}
                            className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded"
                          />
                          <Button size="sm" onClick={() => addSlot(day.key)}>
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Area Selection Modal */}
      <Modal
        isOpen={showAreaModal}
        onClose={() => setShowAreaModal(false)}
        title="Select Preferred Areas"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select the areas where you prefer to make pickups and deliveries
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {areaOptions.map((area) => {
              const isSelected = selectedAreas.includes(area);
              return (
                <button
                  key={area}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedAreas((prev) => prev.filter((a) => a !== area));
                    } else {
                      setSelectedAreas((prev) => [...prev, area]);
                    }
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && <CheckCircle2 size={16} className="text-emerald-600" />}
                    <span className="font-medium">{area}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowAreaModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => setShowAreaModal(false)}>
              Save Selection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
