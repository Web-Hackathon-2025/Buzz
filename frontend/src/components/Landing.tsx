import { useState, useEffect } from 'react';
import { 
  Search, Shield, Calendar, DollarSign, 
  Wrench, Zap, BookOpen, Sparkles, 
  Star, Users, CheckCircle, TrendingUp,
  MapPin, Clock, Award, Heart,
  ArrowRight, Play, Phone, Mail,
  Facebook, Twitter, Instagram, Linkedin,
  Menu, X, ChevronRight, Check
} from 'lucide-react';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Search,
      title: 'Hyperlocal Search',
      description: 'Find trusted service providers near you with real-time location-based search powered by advanced geolocation technology. Our intelligent matching system connects you with professionals in your immediate area.',
      color: 'from-amber-600 to-orange-600'
    },
    {
      icon: Shield,
      title: 'Verified Providers',
      description: 'All our service providers undergo rigorous verification processes. Every professional is background-checked, licensed, and rated by customers. Quality guaranteed for every service you book.',
      color: 'from-amber-700 to-yellow-700'
    },
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Book services in minutes with our streamlined booking system. Check real-time availability, schedule appointments that fit your timeline, and manage all your bookings in one convenient dashboard.',
      color: 'from-amber-800 to-orange-800'
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'No hidden charges or surprise fees. See upfront pricing for all services with detailed breakdowns. Compare prices across providers and choose the best value for your specific needs.',
      color: 'from-amber-900 to-yellow-900'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Search Providers',
      description: 'Enter your location and service type to find nearby verified providers. Our advanced search filters help you narrow down to the perfect match.',
      icon: Search
    },
    {
      number: '02',
      title: 'Choose & Book',
      description: 'Browse detailed profiles, read authentic customer reviews, and compare ratings. Book your preferred service provider with just a few clicks.',
      icon: Calendar
    },
    {
      number: '03',
      title: 'Get Service',
      description: 'Your provider arrives on time and delivers quality service as promised. Track your booking in real-time and communicate directly with your service professional.',
      icon: CheckCircle
    },
    {
      number: '04',
      title: 'Rate & Review',
      description: 'Share your experience and help others make better decisions. Your feedback helps maintain our high quality standards and rewards excellent providers.',
      icon: Star
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Providers', icon: Users },
    { number: '50K+', label: 'Happy Customers', icon: Heart },
    { number: '100K+', label: 'Services Completed', icon: CheckCircle },
    { number: '4.8/5', label: 'Average Rating', icon: Star }
  ];

  const categories = [
    { name: 'Plumber', icon: Wrench, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Electrician', icon: Zap, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'Tutor', icon: BookOpen, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { name: 'House Cleaning', icon: Sparkles, color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { name: 'Technician', icon: Wrench, color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { name: 'More Services', icon: ChevronRight, color: 'bg-stone-100 text-stone-700 border-stone-300' }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Save Time',
      description: 'No more calling multiple providers or waiting for callbacks. Find and book instantly.'
    },
    {
      icon: DollarSign,
      title: 'Best Prices',
      description: 'Compare prices from multiple providers and choose the best deal for your budget.'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'All transactions are secure and all providers are verified for your peace of mind.'
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Only verified, highly-rated professionals make it to our platform.'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Homeowner',
      content: 'Found an excellent plumber within minutes. The service was professional and reasonably priced. Karigar made it so easy!',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Business Owner',
      content: 'As a business owner, I need reliable service providers. Karigar has become my go-to platform for all maintenance needs.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Parent',
      content: 'Found a great tutor for my daughter through Karigar. The verification process gave me confidence, and the results speak for themselves.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-700 to-orange-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 bg-clip-text text-transparent">
                Karigar
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-stone-700 hover:text-amber-700 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-stone-700 hover:text-amber-700 transition-colors font-medium">How It Works</a>
              <a href="#services" className="text-stone-700 hover:text-amber-700 transition-colors font-medium">Services</a>
              <a href="#testimonials" className="text-stone-700 hover:text-amber-700 transition-colors font-medium">Reviews</a>
              <button className="px-6 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors font-medium">
                Sign In
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-lg hover:shadow-lg hover:from-amber-800 hover:to-orange-800 transition-all font-medium">
                Get Started
              </button>
            </div>
            <button 
              className="md:hidden text-stone-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-amber-100">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-stone-700 hover:text-amber-700">Features</a>
              <a href="#how-it-works" className="block text-stone-700 hover:text-amber-700">How It Works</a>
              <a href="#services" className="block text-stone-700 hover:text-amber-700">Services</a>
              <a href="#testimonials" className="block text-stone-700 hover:text-amber-700">Reviews</a>
              <button className="w-full px-6 py-2 bg-stone-100 text-stone-700 rounded-lg">Sign In</button>
              <button className="w-full px-6 py-2 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-lg">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className={`text-center ${isVisible ? 'animate-fadeInUp' : ''}`}>
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold border border-amber-200">
                Find trusted service providers near you
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-amber-800 via-orange-800 to-amber-900 bg-clip-text text-transparent leading-tight">
              Your Trusted<br />Service Partner
            </h1>
            <p className="text-xl md:text-2xl text-stone-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Connect with verified local service providers instantly. From plumbers to tutors, 
              find the perfect professional for every need in your neighborhood. Experience the convenience 
              of professional services at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="px-8 py-4 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                Find Services Now
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-white text-stone-700 rounded-xl font-semibold text-lg border-2 border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                <Play size={20} />
                Watch Demo
              </button>
            </div>

            {/* Search Bar */}
            <div className="mt-16 max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2 border border-stone-200">
                <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-stone-50 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500 transition-all">
                  <Search className="text-stone-400" size={20} />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    className="flex-1 border-none outline-none bg-transparent text-lg text-stone-700 placeholder-stone-400"
                  />
                </div>
                <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-stone-50 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500 transition-all">
                  <MapPin className="text-stone-400" size={20} />
                  <input
                    type="text"
                    placeholder="Location"
                    className="flex-1 border-none outline-none bg-transparent text-lg text-stone-700 placeholder-stone-400"
                  />
                </div>
                <button className="px-8 py-4 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                  Search
                  <Search size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl hover:bg-amber-50 transition-all cursor-pointer group border border-stone-100"
                >
                  <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="text-amber-700" size={32} />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-stone-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Karigar</span>?
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Experience the future of service booking with features designed for your convenience and peace of mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-stone-100 ${
                    activeFeature === index ? 'ring-2 ring-amber-500' : ''
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform shadow-md`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-3">{feature.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Benefits You'll <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Love</span>
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Discover what makes Karigar the preferred choice for millions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-amber-700 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-3">{benefit.title}</h3>
                  <p className="text-stone-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              How It <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Getting the service you need is just a few clicks away
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 transform translate-x-4 -translate-y-1/2" style={{ width: 'calc(100% - 4rem)' }}></div>
                  )}
                  <div className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all transform hover:scale-105 border border-stone-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                      <Icon className="text-white" size={32} />
                    </div>
                    <div className="text-sm font-bold text-amber-700 mb-2">{step.number}</div>
                    <h3 className="text-xl font-bold text-stone-900 mb-3">{step.title}</h3>
                    <p className="text-stone-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services/Categories Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Popular <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Services</span>
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Browse through our most popular service categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className={`${category.color} rounded-2xl p-6 text-center hover:scale-110 hover:shadow-lg transition-all cursor-pointer transform border-2`}
                >
                  <div className="flex justify-center mb-3">
                    <Icon size={32} />
                  </div>
                  <div className="font-bold text-sm">{category.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-stone-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              What Our <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Customers</span> Say
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Real experiences from people who trust Karigar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-stone-200 hover:shadow-xl transition-all"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-amber-500 fill-amber-500" size={20} />
                  ))}
                </div>
                <p className="text-stone-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-stone-900">{testimonial.name}</div>
                  <div className="text-stone-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Shield className="text-amber-700 mb-3" size={40} />
              <h3 className="font-bold text-stone-900 mb-2">100% Verified</h3>
              <p className="text-stone-600">All providers are background checked</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="text-amber-700 mb-3" size={40} />
              <h3 className="font-bold text-stone-900 mb-2">Quality Guaranteed</h3>
              <p className="text-stone-600">Only top-rated professionals</p>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="text-amber-700 mb-3" size={40} />
              <h3 className="font-bold text-stone-900 mb-2">Growing Community</h3>
              <p className="text-stone-600">Join thousands of satisfied customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-amber-800 via-orange-800 to-amber-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-amber-100 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Karigar for their service needs. 
            Experience the convenience of professional services delivered to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-amber-800 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
              Sign Up Free
              <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-700 to-orange-700 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <span className="text-2xl font-bold">Karigar</span>
              </div>
              <p className="text-stone-400 mb-4">
                Your trusted partner for finding quality service providers in your neighborhood.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-stone-400 hover:text-amber-500 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-stone-400 hover:text-amber-500 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-stone-400 hover:text-amber-500 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-stone-400 hover:text-amber-500 transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Plumbing</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Electrical</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Tutoring</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Cleaning</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">FAQs</a></li>
              </ul>
              <div className="mt-6">
                <div className="flex items-center gap-2 text-stone-400 mb-2">
                  <Phone size={16} />
                  <span>+91 123 456 7890</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <Mail size={16} />
                  <span>support@karigar.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-8 text-center text-stone-400">
            <p>&copy; 2024 Karigar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
