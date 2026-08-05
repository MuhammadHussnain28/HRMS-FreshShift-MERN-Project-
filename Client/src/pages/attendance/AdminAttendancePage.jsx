import { Link } from 'react-router-dom';

export default function AdminAttendancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-semibold text-navy mb-2">Coming Soon — Admin Attendance</h1>
      <p className="text-muted-text mb-6">Admin Attendance page is under construction.</p>
      <Link to="/" className="text-teal hover:underline">← Back to Home</Link>
    </div>
  );
}
