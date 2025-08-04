import { useState } from "react";
import { Eye, EyeOff, Package, BarChart3, Shield, Users, CheckCircle, Star, ArrowRight, 
         TrendingUp, Zap, Award, Globe, Lock, Sparkles, Rocket, Heart, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const { signIn, signUp, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    role: "customer" as "admin" | "customer"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.businessName);
      } else {
        await signIn(formData.email, formData.password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process inventory updates in real-time with our blazing fast system",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "AI-powered insights that help you make data-driven decisions",
      gradient: "from-green-400 to-blue-500"
    },
    {
      icon: Lock,
      title: "Bank-Level Security",
      description: "Military-grade encryption protects your business data 24/7",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Recognized as the #1 inventory solution by industry experts",
      gradient: "from-blue-400 to-purple-500"
    }
  ];

  const testimonials = [
    { name: "Sarah Chen", role: "CEO, TechShop", rating: 5, text: "Increased our efficiency by 300%" },
    { name: "Marcus Johnson", role: "Owner, FreshMart", rating: 5, text: "Best investment for our business" },
    { name: "Elena Rodriguez", role: "Manager, StyleCo", rating: 5, text: "Revolutionary inventory management" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden font-inter">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-500/25 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 left-20 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-40 right-32 w-5 h-5 bg-blue-400 rounded-full animate-bounce delay-1000"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-75"></div>
                <div className="relative w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-playfair bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  SwiffPass Technology
                </h1>
                <p className="text-sm text-purple-200 font-medium">Premium Inventory Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-white">4.9/5</span>
                <span className="text-xs text-purple-200">from 15,000+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-12 animate-fade-in">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/20">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Trusted by 50,000+ businesses worldwide
                </span>
                <Rocket className="h-5 w-5 text-blue-400" />
              </div>
              
              <h2 className="text-6xl lg:text-7xl font-bold font-playfair leading-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
                  Business Today
                </span>
              </h2>
              
              <p className="text-xl text-purple-100 leading-relaxed max-w-lg font-medium">
                Join the revolution of smart inventory management. Experience the future of business automation 
                with our AI-powered platform that <span className="text-yellow-300 font-semibold">grows your revenue by 400%</span>.
              </p>
              
              <div className="flex items-center gap-8 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white font-playfair">$2.5M+</div>
                  <div className="text-sm text-purple-200">Revenue Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white font-playfair">99.99%</div>
                  <div className="text-sm text-purple-200">Uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white font-playfair">24/7</div>
                  <div className="text-sm text-purple-200">Expert Support</div>
                </div>
              </div>
              
              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                  ))}
                </div>
                <div className="text-white">
                  <div className="font-semibold">Join 50,000+ happy customers</div>
                  <div className="text-sm text-purple-200">who love our platform</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative group">
              <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-yellow-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80"
                    alt="Modern business dashboard"
                    className="rounded-2xl shadow-2xl w-full h-80 object-cover"
                  />
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-4 shadow-2xl">
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold font-playfair">+400%</div>
                      <div className="text-xs">Revenue Growth</div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 shadow-2xl">
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold font-playfair">50K+</div>
                      <div className="text-xs">Happy Users</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="group relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:transform hover:scale-105"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-2 text-lg group-hover:text-yellow-300 transition-colors font-playfair">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-purple-200 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Testimonials */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white font-playfair">What our customers say:</h3>
              <div className="grid gap-4">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{testimonial.name}</span>
                        <span className="text-purple-300 text-xs">{testimonial.role}</span>
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-purple-200 text-sm">"{testimonial.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-yellow-500/20 rounded-3xl blur-2xl"></div>
              <Card className="relative w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl animate-scale-in">
                <CardHeader className="space-y-6 text-center pb-6">
                  <div className="mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-75"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Crown className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-3xl font-bold font-playfair bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                      {isSignUp ? "Join the Elite" : "Welcome Back, Pro"}
                    </CardTitle>
                    <CardDescription className="text-base text-purple-200">
                      {isSignUp 
                        ? "Start your journey to business excellence with our premium platform" 
                        : "Continue building your empire with SwiffPass Technology"
                      }
                    </CardDescription>
                  </div>
                  {!isSignUp && (
                    <div className="flex items-center justify-center gap-3 text-sm bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/30">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-300 font-medium">Secured with 256-bit encryption</span>
                    </div>
                  )}
                </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          type="text"
                          placeholder="Your business name"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          required={isSignUp}
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Account Type</Label>
                        <Select value={formData.role} onValueChange={(value: "admin" | "customer") => setFormData({ ...formData, role: value })}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer Portal</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required={isSignUp}
                        className="h-11"
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600 text-white font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 group text-lg relative overflow-hidden" 
                    disabled={loading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="font-playfair">Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 relative">
                        <Sparkles className="h-5 w-5" />
                        <span className="font-playfair">{isSignUp ? "Start My Journey" : "Enter Dashboard"}</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-black/40 text-purple-200 font-medium">or</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-purple-200">
                    {isSignUp ? "Already part of the elite?" : "Ready to join the revolution?"}
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="ml-2 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-bold hover:from-purple-300 hover:to-pink-300 transition-all duration-300 story-link"
                    >
                      {isSignUp ? "Sign in now" : "Join today"}
                    </button>
                  </p>
                  
                  {isSignUp && (
                    <div className="text-xs text-purple-300 px-4 leading-relaxed">
                      By joining, you agree to our <span className="text-yellow-400 font-medium">Terms of Service</span> and <span className="text-yellow-400 font-medium">Privacy Policy</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="flex items-center gap-2 text-xs text-purple-300">
                      <Globe className="h-4 w-4" />
                      <span>Available worldwide</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-300">
                      <Lock className="h-4 w-4" />
                      <span>Bank-level security</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
