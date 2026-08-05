import { Link } from 'react-router-dom';

export default function EmployeesListPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-semibold text-navy mb-2">Coming Soon — Employees</h1>
      <p className="text-muted-text mb-6">Employees page is under construction.</p>
      <Link to="/" className="text-teal hover:underline">← Back to Home</Link>
    </div>
  );
}
