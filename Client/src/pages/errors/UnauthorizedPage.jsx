import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-semibold text-navy mb-2">Access Denied</h1>
      <p className="text-muted-text mb-6">Access Denied — You do not have permission to view this page.</p>
      <Link to="/dashboard" className="text-teal hover:underline">← Back to Dashboard</Link>
    </div>
  );
}
