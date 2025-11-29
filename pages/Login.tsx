import React from 'react';
import { Card, Button, Input } from '../components/UIComponents';
import { Link, useNavigate } from 'react-router-dom';

export const Login: React.FC<{ isSignup?: boolean }> = ({ isSignup }) => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Mock auth logic
      localStorage.setItem('auth_token', 'mock_token');
      navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-brand-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">S</div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                {isSignup ? 'Start your agency trial' : 'Sign in to SocialAI'}
            </h2>
        </div>
        <Card className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input label="Email Address" type="email" placeholder="you@agency.com" required />
                <Input label="Password" type="password" required />
                {isSignup && <Input label="Agency Name" type="text" required />}
                
                <Button type="submit" className="w-full" size="lg">
                    {isSignup ? 'Create Account' : 'Sign In'}
                </Button>
            </form>
            <div className="mt-6 text-center text-sm">
                <Link to={isSignup ? "/login" : "/signup"} className="font-medium text-brand-600 hover:text-brand-500">
                    {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </Link>
            </div>
        </Card>
      </div>
    </div>
  );
};