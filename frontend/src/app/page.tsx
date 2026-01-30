import Link from 'next/link';
import {
  Heart,
  ShieldCheck,
  Truck,
  MapPin,
  Bell,
  Award,
  Users,
  Leaf,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <span className="font-bold text-xl text-gray-900">FoodShare</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">How it Works</a>
              <a href="#impact" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Impact</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
              <Leaf size={16} />
              Reducing Food Waste, Feeding Communities
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Bridge the Gap Between{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Surplus & Need
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A technology-enabled ecosystem connecting restaurants, hotels, and event organizers 
              with NGOs and shelters to redistribute surplus food safely and efficiently.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register?role=donor"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Start Donating <ArrowRight size={20} />
              </Link>
              <Link
                href="/auth/register?role=ngo"
                className="w-full sm:w-auto px-8 py-4 border-2 border-emerald-600 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
              >
                Register as NGO
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { value: '50K+', label: 'Meals Redistributed' },
              { value: '200+', label: 'Partner Organizations' },
              { value: '15K+', label: 'Kg Food Saved' },
              { value: '10K+', label: 'Lives Impacted' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-md border border-gray-100">
                <p className="text-3xl md:text-4xl font-bold text-emerald-600">{stat.value}</p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to make food redistribution safe, efficient, and impactful
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="text-emerald-600" size={32} />,
                title: 'Food Safety Compliance',
                description: 'Automated hygiene validation, perishability checks, and safety declarations ensure only safe food reaches beneficiaries.',
              },
              {
                icon: <Heart className="text-pink-600" size={32} />,
                title: 'Intelligent Matching',
                description: 'Smart algorithms match surplus food with nearby NGOs based on urgency, capacity, and expiry windows.',
              },
              {
                icon: <Truck className="text-blue-600" size={32} />,
                title: 'Volunteer Coordination',
                description: 'Efficient pickup assignment, optimized routes, and real-time tracking for seamless logistics.',
              },
              {
                icon: <MapPin className="text-orange-600" size={32} />,
                title: 'Live Tracking',
                description: 'GPS-enabled tracking with live ETAs, delivery updates, and complete visibility for all stakeholders.',
              },
              {
                icon: <Bell className="text-purple-600" size={32} />,
                title: 'Smart Notifications',
                description: 'Proactive alerts for expiry warnings, pickup reminders, and delivery status updates.',
              },
              {
                icon: <Award className="text-amber-600" size={32} />,
                title: 'Impact & Recognition',
                description: 'Track environmental impact, earn trust badges, and receive certificates for contributions.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-gray-100 hover:border-emerald-200"
              >
                <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple 4-step process to redistribute surplus food efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Report Surplus',
                description: 'Donors report available food with safety details and pickup window.',
              },
              {
                step: '02',
                title: 'Verify & Match',
                description: 'System validates safety and matches with nearby NGOs.',
              },
              {
                step: '03',
                title: 'Coordinate Pickup',
                description: 'Volunteers are assigned with optimized routes for collection.',
              },
              {
                step: '04',
                title: 'Deliver & Impact',
                description: 'Food reaches beneficiaries. Track impact and earn recognition.',
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Who Can Join?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Different stakeholders, one shared mission of zero food waste
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="text-emerald-600" size={40} />,
                title: 'Donors',
                items: ['Restaurants', 'Hotels & Caterers', 'Corporate Canteens', 'Event Organizers'],
              },
              {
                icon: <Heart className="text-pink-600" size={40} />,
                title: 'Consumers',
                items: ['NGOs', 'Shelters', 'Community Kitchens', 'Food Banks'],
              },
              {
                icon: <Truck className="text-blue-600" size={40} />,
                title: 'Volunteers',
                items: ['Individual Volunteers', 'Delivery Coordinators', 'Local Heroes', 'Support Staff'],
              },
              {
                icon: <ShieldCheck className="text-purple-600" size={40} />,
                title: 'Administrators',
                items: ['Platform Managers', 'Safety Auditors', 'Policy Enforcers', 'Data Analysts'],
              },
            ].map((role, index) => (
              <div
                key={index}
                className="p-8 bg-gray-50 rounded-2xl border border-gray-100"
              >
                <div className="mb-6">{role.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{role.title}</h3>
                <ul className="space-y-2">
                  {role.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="impact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">Ready to Make an Impact?</h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join our community of donors, NGOs, and volunteers working together to eliminate food waste and hunger.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
              >
                Get Started Today
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Login to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <span className="font-bold text-xl text-white">FoodShare</span>
            </div>
            <p className="text-sm">
              © 2026 FoodShare - Food Redistribution Platform. Made with ❤️ by Group 13
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
