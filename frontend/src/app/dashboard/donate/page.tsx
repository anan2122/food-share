'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Clock,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Info,
} from 'lucide-react';
import { Card, Button, Input, Select, Textarea, Toggle, Badge } from '@/components/ui';
import ImageUpload from '@/components/ui/ImageUpload';
import apiClient from '@/lib/api-client';

const foodTypes = [
  { value: 'cooked', label: 'Cooked Food' },
  { value: 'raw', label: 'Raw Ingredients' },
  { value: 'packaged', label: 'Packaged Food' },
  { value: 'bakery', label: 'Bakery Items' },
  { value: 'fruits_vegetables', label: 'Fruits & Vegetables' },
  { value: 'dairy', label: 'Dairy Products' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'mixed', label: 'Mixed Items' },
];

const quantityUnits = [
  { value: 'servings', label: 'Servings' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'liters', label: 'Liters' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'boxes', label: 'Boxes' },
];

const storageConditions = [
  { value: 'room_temperature', label: 'Room Temperature' },
  { value: 'refrigerated', label: 'Refrigerated (0-4°C)' },
  { value: 'frozen', label: 'Frozen (-18°C)' },
  { value: 'hot', label: 'Hot (Above 60°C)' },
];

const commonAllergens = [
  'Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts', 'Soy', 'Fish', 'Shellfish', 'Sesame'
];

export default function DonateFoodPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Food Details
    foodType: '',
    foodName: '',
    description: '',
    quantity: '',
    quantityUnit: 'servings',
    estimatedServings: '',
    images: [] as string[],
    
    // Safety Information
    preparationTime: '',
    expiryTime: '',
    storageCondition: '',
    allergens: [] as string[],
    isVegetarian: false,
    isVegan: false,
    isHalal: false,
    
    // Hygiene Declaration
    handlingCompliance: false,
    temperatureCompliance: false,
    packagingCompliance: false,
    noContamination: false,
    
    // Location
    pickupAddress: '',
    pickupCity: '',
    pickupState: '',
    pickupInstructions: '',
    pickupDeadline: '',
    pickupTimeStart: '',
    pickupTimeEnd: '',
  });

  const updateFormData = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAllergen = (allergen: string) => {
    const current = formData.allergens;
    if (current.includes(allergen)) {
      updateFormData('allergens', current.filter((a) => a !== allergen));
    } else {
      updateFormData('allergens', [...current, allergen]);
    }
  };

  // Calculate time remaining until expiry
  const calculateTimeRemaining = (): { hours: number; isValid: boolean; isCritical: boolean } => {
    if (!formData.expiryTime) return { hours: 0, isValid: false, isCritical: false };
    
    const expiry = new Date(formData.expiryTime);
    const now = new Date();
    const hours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return {
      hours: Math.round(hours * 10) / 10,
      isValid: hours > 0,
      isCritical: hours <= 2,
    };
  };

  const timeRemaining = calculateTimeRemaining();

  const isHygieneComplete = 
    formData.handlingCompliance && 
    formData.temperatureCompliance && 
    formData.packagingCompliance && 
    formData.noContamination;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const donationData = {
        title: formData.foodName,
        description: formData.description,
        foodType: formData.foodType,
        quantity: parseInt(formData.estimatedServings || formData.quantity),
        quantityUnit: formData.quantityUnit,
        expiryTime: formData.expiryTime,
        preparationTime: formData.preparationTime,
        storageCondition: formData.storageCondition,
        dietaryInfo: {
          isVegetarian: formData.isVegetarian,
          isVegan: formData.isVegan,
          isHalal: formData.isHalal,
          allergens: formData.allergens,
        },
        images: formData.images,
        pickupAddress: {
          street: formData.pickupAddress,
          city: formData.pickupCity,
          state: formData.pickupState || 'Unknown',
          zipCode: '',
        },
        pickupTimeStart: formData.pickupTimeStart || formData.pickupDeadline,
        pickupTimeEnd: formData.pickupDeadline,
        pickupInstructions: formData.pickupInstructions,
      };

      const response = await apiClient.createDonation(donationData);
      
      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/my-donations');
        }, 3000);
      } else {
        throw new Error(response.error || 'Failed to create donation');
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      alert('Failed to submit donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Donation Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your food donation has been submitted for verification. You&apos;ll receive a notification once it&apos;s approved and matched with an NGO.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full">
            <Clock size={16} />
            <span>Estimated matching time: 15-30 minutes</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Donate Surplus Food</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Help reduce food waste by donating safe, edible surplus food
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { num: 1, label: 'Food Details' },
          { num: 2, label: 'Safety Info' },
          { num: 3, label: 'Hygiene Declaration' },
          { num: 4, label: 'Pickup Details' },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.num ? <CheckCircle2 size={20} /> : s.num}
              </div>
              <span className="text-xs mt-1 text-gray-500 hidden sm:block">{s.label}</span>
            </div>
            {idx < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step > s.num ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        {/* Step 1: Food Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <UtensilsCrossed className="text-emerald-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Food Details</h2>
                <p className="text-sm text-gray-500">Describe the food you&apos;re donating</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Food Type"
                options={foodTypes}
                value={formData.foodType}
                onChange={(e) => updateFormData('foodType', e.target.value)}
                placeholder="Select food type"
                required
              />

              <Input
                label="Food Name"
                placeholder="e.g., Vegetable Biryani"
                value={formData.foodName}
                onChange={(e) => updateFormData('foodName', e.target.value)}
                required
              />
            </div>

            <Textarea
              label="Description"
              placeholder="Describe the food items, ingredients, and any other relevant details..."
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Quantity"
                type="number"
                placeholder="e.g., 50"
                value={formData.quantity}
                onChange={(e) => updateFormData('quantity', e.target.value)}
                required
              />

              <Select
                label="Unit"
                options={quantityUnits}
                value={formData.quantityUnit}
                onChange={(e) => updateFormData('quantityUnit', e.target.value)}
              />

              <Input
                label="Estimated Servings"
                type="number"
                placeholder="e.g., 50"
                value={formData.estimatedServings}
                onChange={(e) => updateFormData('estimatedServings', e.target.value)}
                required
              />
            </div>

            {/* Dietary Labels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Dietary Information</label>
              <div className="flex flex-wrap gap-4">
                <Toggle
                  enabled={formData.isVegetarian}
                  onChange={(v) => updateFormData('isVegetarian', v)}
                  label="Vegetarian"
                />
                <Toggle
                  enabled={formData.isVegan}
                  onChange={(v) => updateFormData('isVegan', v)}
                  label="Vegan"
                />
                <Toggle
                  enabled={formData.isHalal}
                  onChange={(v) => updateFormData('isHalal', v)}
                  label="Halal"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <ImageUpload
              images={formData.images}
              onChange={(images) => updateFormData('images', images)}
              maxImages={3}
              label="Food Photos (Optional)"
            />

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} size="lg">
                Continue to Safety Info
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Safety Information */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Safety Information</h2>
                <p className="text-sm text-gray-500">Provide food safety and timing details</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-amber-800">Important Safety Notice</p>
                <p className="text-sm text-amber-700">
                  Food will be automatically rejected if it exceeds safe consumption time limits. 
                  Please ensure accurate preparation and expiry times.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Preparation Date & Time"
                type="datetime-local"
                value={formData.preparationTime}
                onChange={(e) => updateFormData('preparationTime', e.target.value)}
                required
              />

              <Input
                label="Safe Consumption Until"
                type="datetime-local"
                value={formData.expiryTime}
                onChange={(e) => updateFormData('expiryTime', e.target.value)}
                required
              />
            </div>

            {formData.expiryTime && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                !timeRemaining.isValid 
                  ? 'bg-red-50 border border-red-200' 
                  : timeRemaining.isCritical 
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-green-50 border border-green-200'
              }`}>
                <Clock size={20} className={
                  !timeRemaining.isValid 
                    ? 'text-red-600' 
                    : timeRemaining.isCritical 
                      ? 'text-amber-600'
                      : 'text-green-600'
                } />
                <div>
                  <p className={`font-medium ${
                    !timeRemaining.isValid 
                      ? 'text-red-800' 
                      : timeRemaining.isCritical 
                        ? 'text-amber-800'
                        : 'text-green-800'
                  }`}>
                    {!timeRemaining.isValid 
                      ? 'Food has already expired!' 
                      : `${timeRemaining.hours} hours remaining until expiry`
                    }
                  </p>
                  {timeRemaining.isCritical && timeRemaining.isValid && (
                    <p className="text-sm text-amber-700">This food will be marked as high priority</p>
                  )}
                </div>
              </div>
            )}

            <Select
              label="Storage Condition"
              options={storageConditions}
              value={formData.storageCondition}
              onChange={(e) => updateFormData('storageCondition', e.target.value)}
              placeholder="Select storage condition"
              required
            />

            {/* Allergens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Allergens Present <span className="text-gray-400">(Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {commonAllergens.map((allergen) => (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergen(allergen)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.allergens.includes(allergen)
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {allergen}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} size="lg">
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                size="lg"
                disabled={!timeRemaining.isValid}
              >
                Continue to Hygiene Declaration
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Hygiene Declaration */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Thermometer className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Hygiene Declaration</h2>
                <p className="text-sm text-gray-500">Confirm food safety compliance</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-blue-800">Hygiene Compliance Required</p>
                <p className="text-sm text-blue-700">
                  All declarations must be confirmed to ensure food safety. False declarations may result in account suspension.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <Toggle
                  enabled={formData.handlingCompliance}
                  onChange={(v) => updateFormData('handlingCompliance', v)}
                  label="Safe Food Handling"
                  description="Food has been prepared and handled following safe food handling practices including proper handwashing and use of clean utensils."
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <Toggle
                  enabled={formData.temperatureCompliance}
                  onChange={(v) => updateFormData('temperatureCompliance', v)}
                  label="Temperature Control"
                  description="Food has been stored at appropriate temperatures. Hot food above 60°C, cold food below 4°C."
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <Toggle
                  enabled={formData.packagingCompliance}
                  onChange={(v) => updateFormData('packagingCompliance', v)}
                  label="Proper Packaging"
                  description="Food is packaged in clean, food-grade containers that protect from contamination during transport."
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <Toggle
                  enabled={formData.noContamination}
                  onChange={(v) => updateFormData('noContamination', v)}
                  label="No Contamination"
                  description="Food has not been exposed to any contamination, including cross-contamination with raw foods, chemicals, or unsanitary surfaces."
                />
              </div>
            </div>

            {!isHygieneComplete && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <AlertTriangle className="text-amber-600" size={20} />
                <p className="text-amber-800">Please confirm all hygiene declarations to proceed</p>
              </div>
            )}

            {isHygieneComplete && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="text-green-600" size={20} />
                <p className="text-green-800">All hygiene requirements confirmed!</p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} size="lg">
                Back
              </Button>
              <Button 
                onClick={() => setStep(4)} 
                size="lg"
                disabled={!isHygieneComplete}
              >
                Continue to Pickup Details
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Pickup Details */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <MapPin className="text-orange-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Pickup Details</h2>
                <p className="text-sm text-gray-500">Where should volunteers pick up the food?</p>
              </div>
            </div>

            <Textarea
              label="Pickup Address"
              placeholder="Enter complete address with landmark..."
              value={formData.pickupAddress}
              onChange={(e) => updateFormData('pickupAddress', e.target.value)}
              required
            />

            <Input
              label="City"
              placeholder="e.g., Bangalore"
              value={formData.pickupCity}
              onChange={(e) => updateFormData('pickupCity', e.target.value)}
              required
            />

            <Input
              label="Pickup Deadline"
              type="datetime-local"
              value={formData.pickupDeadline}
              onChange={(e) => updateFormData('pickupDeadline', e.target.value)}
              helperText="Latest time by which food should be picked up"
              required
            />

            <Textarea
              label="Pickup Instructions (Optional)"
              placeholder="Any special instructions for the volunteer? (e.g., entrance location, contact person)"
              value={formData.pickupInstructions}
              onChange={(e) => updateFormData('pickupInstructions', e.target.value)}
            />

            {/* Summary */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Donation Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Food</p>
                  <p className="font-medium text-gray-900">{formData.foodName || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="font-medium text-gray-900">{formData.quantity} {formData.quantityUnit}</p>
                </div>
                <div>
                  <p className="text-gray-500">Servings</p>
                  <p className="font-medium text-gray-900">{formData.estimatedServings || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Time Remaining</p>
                  <p className="font-medium text-gray-900">{timeRemaining.hours} hours</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.isVegetarian && <Badge variant="success">Vegetarian</Badge>}
                {formData.isVegan && <Badge variant="success">Vegan</Badge>}
                {formData.isHalal && <Badge variant="success">Halal</Badge>}
                {formData.allergens.map((a) => (
                  <Badge key={a} variant="warning">{a}</Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)} size="lg">
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                size="lg"
                isLoading={isSubmitting}
              >
                Submit Donation
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
