
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Package, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  
  // Separate state for sign-in and sign-up forms
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ email: '', password: '', businessName: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [rateLimitInfo, setRateLimitInfo] = useState<{ isRateLimited: boolean; waitTime?: number }>({ isRateLimited: false });

  const resetMessages = () => {
    setError('');
    setSuccess('');
    setRateLimitInfo({ isRateLimited: false });
  };

  const resetForms = () => {
    setSignInForm({ email: '', password: '' });
    setSignUpForm({ email: '', password: '', businessName: '' });
    resetMessages();
  };

  const extractWaitTime = (errorMessage: string): number | null => {
    const match = errorMessage.match(/(\d+)\s*seconds?/i);
    return match ? parseInt(match[1]) : null;
  };

  const handleSignIn = async () => {
    if (!signInForm.email || !signInForm.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    setRateLimitInfo({ isRateLimited: false });
    
    try {
      await signIn(signInForm.email, signInForm.password);
      setSignInForm({ email: '', password: '' });
      resetMessages();
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      if (err.code === 'invalid_credentials') {
        setError("Invalid email or password. If you just signed up, please check your email for a confirmation link first.");
      } else if (err.message === 'Invalid login credentials') {
        setError("Invalid email or password. If you just signed up, please check your email for a confirmation link first.");
      } else if (err.code === 'over_email_send_rate_limit' || err.message?.includes('rate limit')) {
        const waitTime = extractWaitTime(err.message) || 60;
        setRateLimitInfo({ isRateLimited: true, waitTime });
        // Suppress noisy rate limit error message; keep UI disabled briefly
        setError('');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUpForm.email || !signUpForm.password || !signUpForm.businessName) {
      setError('Please fill in all fields');
      return;
    }

    if (signUpForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpForm.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    setRateLimitInfo({ isRateLimited: false });
    
    try {
      await signUp(signUpForm.email, signUpForm.password, signUpForm.businessName);
      
      // Show toast notification
      toast({
        title: "Account Created Successfully!",
        description: "Please check your email for a confirmation link before signing in.",
      });
      
      setSuccess('Account created successfully! Please check your email for a confirmation link before signing in.');
      setSignUpForm({ email: '', password: '', businessName: '' });
      resetMessages();
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      if (err.code === 'email_address_invalid') {
        setError("Please use a different email address. Try using a common email provider like Gmail, Yahoo, or Outlook.");
      } else if (err.code === 'weak_password') {
        setError("Password must be at least 6 characters long.");
      } else if (err.code === 'over_email_send_rate_limit' || err.message?.includes('rate limit') || err.message?.includes('56 seconds')) {
        const waitTime = extractWaitTime(err.message) || 60;
        setRateLimitInfo({ isRateLimited: true, waitTime });
        // Suppress noisy rate limit error message
        setError('');
      } else if (err.code === 'signup_disabled') {
        setError("New signups are temporarily disabled. Please try again later.");
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Package className="h-6 w-6" />
            SwiffPass Technology
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full" onValueChange={(value) => {
            setActiveTab(value);
            resetMessages();
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signInForm.email}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isSubmitting || rateLimitInfo.isRateLimited}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isSubmitting || rateLimitInfo.isRateLimited}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    {rateLimitInfo.isRateLimited && <Clock className="h-4 w-4" />}
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  onClick={handleSignIn} 
                  className="w-full" 
                  disabled={isSubmitting || rateLimitInfo.isRateLimited}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : rateLimitInfo.isRateLimited ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Please wait...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email (use Gmail, Yahoo, etc.)"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isSubmitting || rateLimitInfo.isRateLimited}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Enter your password (min 6 characters)"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isSubmitting || rateLimitInfo.isRateLimited}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    type="text"
                    placeholder="Enter your business name"
                    value={signUpForm.businessName}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, businessName: e.target.value }))}
                    disabled={isSubmitting || rateLimitInfo.isRateLimited}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    {rateLimitInfo.isRateLimited && <Clock className="h-4 w-4" />}
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  onClick={handleSignUp} 
                  className="w-full" 
                  disabled={isSubmitting || rateLimitInfo.isRateLimited}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : rateLimitInfo.isRateLimited ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Please wait...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
                
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
