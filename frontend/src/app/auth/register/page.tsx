'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';

type UserRole = 'donor' | 'ngo' | 'volunteer';

const roleOptions = [
  { value: 'donor', label: 'Donor (Restaurant, Hotel, Caterer)' },
  { value: 'ngo', label: 'NGO / Shelter / Community Kitchen' },
  { value: 'volunteer', label: 'Volunteer' },
];

const organizationTypes = {
  donor: [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'caterer', label: 'Caterer' },
    { value: 'corporate', label: 'Corporate Canteen' },
    { value: 'individual', label: 'Individual' },
  ],
  ngo: [
    { value: 'ngo', label: 'NGO' },
    { value: 'shelter', label: 'Shelter' },
    { value: 'community_kitchen', label: 'Community Kitchen' },
  ],
};

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as UserRole || 'donor';

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: defaultRole,
    organizationName: '',
    organizationType: '',
    registrationNumber: '',
    capacity: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (currentStep: number): boolean => {
    setError('');

    if (currentStep === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.name || !formData.phone || !formData.role) {
        setError('Please fill in all fields');
        return false;
      }
      if (formData.role !== 'volunteer' && !formData.organizationType) {
        setError('Please select organization type');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
        setError('Please fill in all address fields');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);
    setError('');

    try {
      const { default: apiClient } = await import('@/lib/api-client');
      const response = await apiClient.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        organizationName: formData.organizationName,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.pincode,
          country: 'India',
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your account has been created. Redirecting to login...
          </p>
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-700 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Heart className="text-white" size={28} />
          </div>
          <span className="font-bold text-2xl text-white">FoodShare</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Join Our Mission
          </h1>
          <p className="text-lg text-emerald-100 max-w-md">
            Be part of the solution. Whether you&apos;re a donor, NGO, or volunteer, 
            together we can eliminate food waste and hunger.
          </p>

          <div className="mt-8 space-y-4">
            {[
              'Report surplus food safely',
              'Connect with verified organizations',
              'Track your impact in real-time',
              'Earn recognition for contributions',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <CheckCircle2 size={20} className="text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">50K+</p>
            <p className="text-emerald-200 text-sm">Meals Saved</p>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="text-center">
            <p className="text-3xl font-bold text-white">200+</p>
            <p className="text-emerald-200 text-sm">Partners</p>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Heart className="text-white" size={28} />
            </div>
            <span className="font-bold text-2xl text-gray-900">FoodShare</span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 h-1 ${
                      step > s ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 1 && 'Create Account'}
              {step === 2 && 'Your Details'}
              {step === 3 && 'Location'}
            </h2>
            <p className="text-gray-600 mt-2">
              {step === 1 && 'Enter your email and create a password'}
              {step === 2 && 'Tell us about yourself'}
              {step === 3 && 'Where are you located?'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Account */}
            {step === 1 && (
              <>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>

                <Button type="button" className="w-full" size="lg" onClick={nextStep}>
                  Continue
                </Button>
              </>
            )}

            {/* Step 2: Personal/Organization Details */}
            {step === 2 && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>

                <Select
                  label="I am registering as"
                  options={roleOptions}
                  value={formData.role}
                  onChange={(e) => updateFormData('role', e.target.value)}
                  required
                />

                {formData.role !== 'volunteer' && (
                  <>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <Input
                        type="text"
                        placeholder="Organization name"
                        value={formData.organizationName}
                        onChange={(e) => updateFormData('organizationName', e.target.value)}
                        className="pl-12"
                      />
                    </div>

                    <Select
                      label="Organization type"
                      options={organizationTypes[formData.role as 'donor' | 'ngo'] || []}
                      value={formData.organizationType}
                      onChange={(e) => updateFormData('organizationType', e.target.value)}
                      placeholder="Select type"
                      required
                    />

                    {formData.role === 'ngo' && (
                      <>
                        <Input
                          label="Registration number"
                          type="text"
                          placeholder="NGO registration number"
                          value={formData.registrationNumber}
                          onChange={(e) => updateFormData('registrationNumber', e.target.value)}
                        />
                        <Input
                          label="Daily intake capacity (servings)"
                          type="number"
                          placeholder="e.g., 100"
                          value={formData.capacity}
                          onChange={(e) => updateFormData('capacity', e.target.value)}
                        />
                      </>
                    )}
                  </>
                )}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" size="lg" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="button" className="flex-1" size="lg" onClick={nextStep}>
                    Continue
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Full address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    required
                  />
                </div>

                <Input
                  type="text"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={(e) => updateFormData('pincode', e.target.value)}
                  required
                />

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" size="lg" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" size="lg" isLoading={isLoading}>
                    Create Account
                  </Button>
                </div>
              </>
            )}
          </form>

          <p className="text-center mt-8 text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
