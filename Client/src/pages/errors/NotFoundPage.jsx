import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-4xl font-bold text-navy mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-muted-text mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved. 
        Please check the URL or navigate back to safety.
      </p>
      <Button asChild size="lg" className="bg-navy hover:bg-navy/90 text-white rounded-lg">
        <Link to="/">
          Return to Homepage
        </Link>
      </Button>
    </div>
  );
}
