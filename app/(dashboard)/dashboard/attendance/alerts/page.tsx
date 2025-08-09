'use client';

export default function AttendanceAlertsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Attendance Alerts</h1>
      <p className="text-gray-600">
        This page will display alerts for students whose attendance falls below a defined threshold.
      </p>
      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-200 text-blue-700">
        <p className="font-medium">Future Features:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Define custom attendance thresholds (e.g., percentage, consecutive absences).</li>
          <li>Automated alerts to parents, teachers, and administrators.</li>
          <li>Detailed reports on alert triggers and actions taken.</li>
          <li>Integration with notification systems (SMS, email).</li>
        </ul>
      </div>
    </div>
  );
}
