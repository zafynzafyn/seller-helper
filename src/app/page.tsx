"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Users,
  DollarSign,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">Seller Helper</span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button variant="etsy">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="etsy">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          AI-Powered Etsy Store Management
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Grow Your Etsy Store<br />
          <span className="text-orange-500">Smarter & Faster</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The all-in-one dashboard for Etsy sellers. Track analytics, optimize listings with AI,
          manage pricing, and build customer relationships.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" variant="etsy" className="text-lg px-8 py-6">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Succeed on Etsy
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Analytics Dashboard"
            description="Track revenue, orders, views, and conversion rates in real-time with beautiful charts."
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8" />}
            title="AI Optimization"
            description="Get AI-powered suggestions for titles, descriptions, and tags to boost your SEO."
          />
          <FeatureCard
            icon={<DollarSign className="h-8 w-8" />}
            title="Pricing Tools"
            description="Calculate fees, margins, and find the optimal price point for your products."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Customer CRM"
            description="Build relationships with customers through notes, tags, and purchase history."
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Why Sellers Love Seller Helper
              </h2>
              <div className="space-y-4">
                <Benefit text="Sync your Etsy store in one click" />
                <Benefit text="AI-generated SEO-optimized listings" />
                <Benefit text="Understand your true profit after fees" />
                <Benefit text="Never miss a customer follow-up" />
                <Benefit text="Track what's working and what's not" />
                <Benefit text="Save hours every week on admin tasks" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 flex items-center justify-center">
              {/* Sales Dashboard Illustration */}
              <div className="w-full max-w-md">
                <svg viewBox="0 0 400 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Background Card */}
                  <rect x="20" y="20" width="360" height="260" rx="16" fill="white" fillOpacity="0.9"/>

                  {/* Header */}
                  <rect x="40" y="40" width="120" height="8" rx="4" fill="#f97316"/>
                  <rect x="40" y="56" width="80" height="6" rx="3" fill="#fed7aa"/>

                  {/* Stats Cards */}
                  <rect x="40" y="80" width="100" height="60" rx="8" fill="#fff7ed"/>
                  <rect x="155" y="80" width="100" height="60" rx="8" fill="#fff7ed"/>
                  <rect x="270" y="80" width="100" height="60" rx="8" fill="#fff7ed"/>

                  {/* Stats Icons */}
                  <circle cx="60" cy="100" r="12" fill="#f97316" fillOpacity="0.2"/>
                  <path d="M56 100L59 103L64 97" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

                  <circle cx="175" cy="100" r="12" fill="#22c55e" fillOpacity="0.2"/>
                  <path d="M175 96V104M171 100H179" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>

                  <circle cx="290" cy="100" r="12" fill="#3b82f6" fillOpacity="0.2"/>
                  <path d="M286 103L290 97L294 103" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

                  {/* Stats Numbers */}
                  <text x="60" y="125" fill="#1f2937" fontSize="14" fontWeight="bold">$12.4k</text>
                  <text x="175" y="125" fill="#1f2937" fontSize="14" fontWeight="bold">847</text>
                  <text x="290" y="125" fill="#1f2937" fontSize="14" fontWeight="bold">+24%</text>

                  {/* Chart Area */}
                  <rect x="40" y="160" width="320" height="100" rx="8" fill="#fff7ed"/>

                  {/* Chart Grid Lines */}
                  <line x1="60" y1="180" x2="340" y2="180" stroke="#fed7aa" strokeWidth="1"/>
                  <line x1="60" y1="200" x2="340" y2="200" stroke="#fed7aa" strokeWidth="1"/>
                  <line x1="60" y1="220" x2="340" y2="220" stroke="#fed7aa" strokeWidth="1"/>
                  <line x1="60" y1="240" x2="340" y2="240" stroke="#fed7aa" strokeWidth="1"/>

                  {/* Chart Bars */}
                  <rect x="70" y="210" width="24" height="35" rx="4" fill="#fdba74"/>
                  <rect x="110" y="195" width="24" height="50" rx="4" fill="#fb923c"/>
                  <rect x="150" y="185" width="24" height="60" rx="4" fill="#f97316"/>
                  <rect x="190" y="200" width="24" height="45" rx="4" fill="#fb923c"/>
                  <rect x="230" y="175" width="24" height="70" rx="4" fill="#ea580c"/>
                  <rect x="270" y="165" width="24" height="80" rx="4" fill="#f97316"/>
                  <rect x="310" y="155" width="24" height="90" rx="4" fill="#ea580c"/>

                  {/* Trend Line */}
                  <path d="M82 205 L122 190 L162 180 L202 195 L242 170 L282 160 L322 150"
                        stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

                  {/* Trend Line Dots */}
                  <circle cx="82" cy="205" r="4" fill="#22c55e"/>
                  <circle cx="122" cy="190" r="4" fill="#22c55e"/>
                  <circle cx="162" cy="180" r="4" fill="#22c55e"/>
                  <circle cx="202" cy="195" r="4" fill="#22c55e"/>
                  <circle cx="242" cy="170" r="4" fill="#22c55e"/>
                  <circle cx="282" cy="160" r="4" fill="#22c55e"/>
                  <circle cx="322" cy="150" r="4" fill="#22c55e"/>
                </svg>
                <div className="text-center mt-4">
                  <p className="text-xl font-bold text-gray-900">Boost Sales</p>
                  <p className="text-gray-600 text-sm">with data-driven insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Etsy Business?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of sellers who use Seller Helper to save time and increase sales.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Seller Helper. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="text-orange-500 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
      <span className="text-lg text-gray-700">{text}</span>
    </div>
  );
}
