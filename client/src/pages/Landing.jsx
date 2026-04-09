import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Briefcase, Search, Users, CheckCircle, Star,
  ArrowRight, Zap, Shield, TrendingUp, ChevronRight
} from 'lucide-react';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import Spinner from '../components/Spinner';

const Landing = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs?limit=6')
      .then((res) => setFeaturedJobs(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Active Jobs', value: '12,000+' },
    { label: 'Companies Hiring', value: '3,500+' },
    { label: 'Candidates Placed', value: '45,000+' },
    { label: 'Success Rate', value: '94%' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Your Profile',
      description: 'Add your skills, experience, and upload your resume in minutes.',
      icon: Users,
      color: 'from-primary-600 to-primary-400',
    },
    {
      step: '02',
      title: 'Get AI-Matched',
      description: 'Our smart algorithm matches you with jobs based on your skill set.',
      icon: Zap,
      color: 'from-teal-600 to-teal-400',
    },
    {
      step: '03',
      title: 'Apply & Track',
      description: 'One-click apply and track your application status in real-time.',
      icon: CheckCircle,
      color: 'from-green-600 to-green-400',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer @ Google',
      avatar: 'S',
      text: 'SmartHire\'s AI matching found me 3 perfectly suited roles I would have missed on my own. Landed my dream job in 3 weeks!',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      role: 'Product Manager @ Stripe',
      avatar: 'M',
      text: 'The skill-based matching is incredible. Every recommendation was relevant to my background. 10/10 experience.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Data Scientist @ Meta',
      avatar: 'P',
      text: 'Posted a job and had 50 qualified applicants in 24 hours. The quality filtering is outstanding.',
      rating: 5,
    },
  ];

  const features = [
    { icon: Zap, title: 'AI-Powered Matching', desc: 'Skill-based algorithm with up to 98% accuracy' },
    { icon: Shield, title: 'Verified Companies', desc: 'All employers are thoroughly vetted' },
    { icon: TrendingUp, title: 'Real-time Tracking', desc: 'Follow every step of your application' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-teal-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-600/30 rounded-full px-4 py-1.5 text-sm text-primary-400 font-medium mb-8 animate-fade-in">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Job Matching — Find jobs that fit
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight animate-slide-up">
            Find Your{' '}
            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-teal-400 bg-clip-text text-transparent">
              Dream Job
            </span>
            <br />
            <span className="text-gray-400">With AI Precision</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            SmartHire matches your skills to the perfect opportunities. Stop wasting time on irrelevant job listings — our AI finds roles made for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link
              to="/jobs"
              id="hero-find-jobs"
              className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-3.5"
            >
              <Search className="w-5 h-5" />
              Find Jobs
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              id="hero-post-job"
              className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-3.5"
            >
              <Briefcase className="w-5 h-5" />
              Post a Job
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl px-4 py-4 text-center"
              >
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="border-y border-gray-800 bg-gray-900/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-600/10 border border-primary-600/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Latest Opportunities</h2>
              <p className="section-subtitle">Freshly posted roles from top companies</p>
            </div>
            <Link
              to="/jobs"
              className="hidden sm:flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              View all jobs
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No jobs available yet. Be the first to post!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/jobs" className="btn-outline">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-900/30 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">How SmartHire Works</h2>
            <p className="section-subtitle">Three simple steps to your next opportunity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-px bg-gradient-to-r from-primary-600/50 to-teal-600/50" />

            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative text-center group">
                  <div className="relative inline-flex mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                    <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto`}>
                      <Icon className="w-9 h-9 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gray-950 border border-gray-700 text-xs font-bold text-gray-400 flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">Join thousands of professionals who found success</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="card relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                {/* Stars */}
                <div className="flex gap-1 mb-4 relative">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed mb-6 relative">"{t.text}"</p>
                <div className="flex items-center gap-3 relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden card text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/15 to-teal-600/10 pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Next Role?</h2>
              <p className="text-gray-400 mb-8">Join 45,000+ professionals who found their dream jobs through SmartHire.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-base px-8 py-3.5">
                  Get Started Free
                </Link>
                <Link to="/jobs" className="btn-secondary text-base px-8 py-3.5">
                  Browse Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          © 2024 SmartHire. All rights reserved. Built with ❤️ for job seekers and recruiters.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
