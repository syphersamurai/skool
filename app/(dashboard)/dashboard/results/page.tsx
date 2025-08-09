'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

interface Result {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  term: string;
  academicYear: string;
  subjects: {
    name: string;
    ca1: number;
    ca2: number;
    exam: number;
    total: number;
    grade: string;
    remarks: string;
  }[];
  totalScore: number;
  averageScore: number;
  position: number;
  classAverage: number;
  teacherRemarks: string;
  principalRemarks: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Mock data for filters
  const classes = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];
  const terms = ['First Term', 'Second Term', 'Third Term'];
  const years = ['2023/2024', '2022/2023', '2021/2022'];
  const statuses = ['draft', 'published'];

  useEffect(() => {
    fetchResults();
  }, [classFilter, termFilter, yearFilter, statusFilter]);

  async function fetchResults() {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockResults: Result[] = [
        {
          id: '1',
          studentId: '1',
          studentName: 'John Doe',
          className: 'Basic 1',
          term: 'First Term',
          academicYear: '2023/2024',
          subjects: [
            { name: 'Mathematics', ca1: 15, ca2: 18, exam: 55, total: 88, grade: 'A', remarks: 'Excellent' },
            { name: 'English', ca1: 12, ca2: 15, exam: 48, total: 75, grade: 'B', remarks: 'Good' },
            { name: 'Science', ca1: 14, ca2: 16, exam: 50, total: 80, grade: 'A', remarks: 'Very Good' },
            { name: 'Social Studies', ca1: 13, ca2: 14, exam: 45, total: 72, grade: 'B', remarks: 'Good' },
          ],
          totalScore: 315,
          averageScore: 78.75,
          position: 2,
          classAverage: 72.5,
          teacherRemarks: 'John is a hardworking student who shows great potential.',
          principalRemarks: 'Keep up the good work, John!',
          status: 'published',
          createdAt: new Date('2023-12-15'),
          updatedAt: new Date('2023-12-18'),
        },
        {
          id: '2',
          studentId: '7',
          studentName: 'Amina Yusuf',
          className: 'Basic 1',
          term: 'First Term',
          academicYear: '2023/2024',
          subjects: [
            { name: 'Mathematics', ca1: 18, ca2: 19, exam: 58, total: 95, grade: 'A', remarks: 'Excellent' },
            { name: 'English', ca1: 15, ca2: 17, exam: 52, total: 84, grade: 'A', remarks: 'Very Good' },
            { name: 'Science', ca1: 16, ca2: 18, exam: 54, total: 88, grade: 'A', remarks: 'Excellent' },
            { name: 'Social Studies', ca1: 14, ca2: 16, exam: 50, total: 80, grade: 'A', remarks: 'Very Good' },
          ],
          totalScore: 347,
          averageScore: 86.75,
          position: 1,
          classAverage: 72.5,
          teacherRemarks: 'Amina is an exceptional student who consistently performs at the highest level.',
          principalRemarks: 'Outstanding performance, Amina!',
          status: 'published',
          createdAt: new Date('2023-12-15'),
          updatedAt: new Date('2023-12-18'),
        },
        {
          id: '3',
          studentId: '8',
          studentName: 'Emeka Obi',
          className: 'Basic 1',
          term: 'First Term',
          academicYear: '2023/2024',
          subjects: [
            { name: 'Mathematics', ca1: 10, ca2: 12, exam: 40, total: 62, grade: 'C', remarks: 'Average' },
            { name: 'English', ca1: 11, ca2: 13, exam: 42, total: 66, grade: 'C', remarks: 'Average' },
            { name: 'Science', ca1: 12, ca2: 14, exam: 44, total: 70, grade: 'B', remarks: 'Good' },
            { name: 'Social Studies', ca1: 10, ca2: 12, exam: 40, total: 62, grade: 'C', remarks: 'Average' },
          ],
          totalScore: 260,
          averageScore: 65,
          position: 3,
          classAverage: 72.5,
          teacherRemarks: 'Emeka needs to put in more effort, especially in Mathematics and Social Studies.',
          principalRemarks: 'There is room for improvement. Keep trying, Emeka!',
          status: 'published',
          createdAt: new Date('2023-12-15'),
          updatedAt: new Date('2023-12-18'),
        },
        {
          id: '4',
          studentId: '9',
          studentName: 'Funke Adeyemi',
          className: 'Basic 2',
          term: 'First Term',
          academicYear: '2023/2024',
          subjects: [
            { name: 'Mathematics', ca1: 14, ca2: 16, exam: 50, total: 80, grade: 'A', remarks: 'Very Good' },
            { name: 'English', ca1: 15, ca2: 17, exam: 52, total: 84, grade: 'A', remarks: 'Very Good' },
            { name: 'Science', ca1: 13, ca2: 15, exam: 48, total: 76, grade: 'B', remarks: 'Good' },
            { name: 'Social Studies', ca1: 14, ca2: 16, exam: 50, total: 80, grade: 'A', remarks: 'Very Good' },
          ],
          totalScore: 320,
          averageScore: 80,
          position: 1,
          classAverage: 75,
          teacherRemarks: 'Funke is a consistent performer who shows great understanding of concepts.',
          principalRemarks: 'Well done, Funke! Keep up the good work.',
          status: 'published',
          createdAt: new Date('2023-12-15'),
          updatedAt: new Date('2023-12-18'),
        },
        {
          id: '5',
          studentId: '10',
          studentName: 'Hassan Mohammed',
          className: 'Basic 3',
          term: 'Second Term',
          academicYear: '2023/2024',
          subjects: [
            { name: 'Mathematics', ca1: 16, ca2: 18, exam: 54, total: 88, grade: 'A', remarks: 'Excellent' },
            { name: 'English', ca1: 14, ca2: 16, exam: 50, total: 80, grade: 'A', remarks: 'Very Good' },
            { name: 'Science', ca1: 15, ca2: 17, exam: 52, total: 84, grade: 'A', remarks: 'Very Good' },
            { name: 'Social Studies', ca1: 13, ca2: 15, exam: 48, total: 76, grade: 'B', remarks: 'Good' },
          ],
          totalScore: 328,
          averageScore: 82,
          position: 2,
          classAverage: 78,
          teacherRemarks: 'Hassan has shown significant improvement this term.',
          principalRemarks: 'Great progress, Hassan! Keep it up.',
          status: 'draft',
          createdAt: new Date('2024-03-20'),
          updatedAt: new Date('2024-03-22'),
        },
      ];

      // Apply filters
      let filteredResults = [...mockResults];
      
      if (classFilter) {
        filteredResults = filteredResults.filter(result => result.className === classFilter);
      }
      
      if (termFilter) {
        filteredResults = filteredResults.filter(result => result.term === termFilter);
      }
      
      if (yearFilter) {
        filteredResults = filteredResults.filter(result => result.academicYear === yearFilter);
      }
      
      if (statusFilter) {
        filteredResults = filteredResults.filter(result => result.status === statusFilter);
      }

      // Apply search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredResults = filteredResults.filter(result => 
          result.studentName.toLowerCase().includes(term) ||
          result.className.toLowerCase().includes(term)
        );
      }

      setResults(filteredResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  }

  // Function to handle search input changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Debounce search for better performance in a real app
    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Academic Results</h2>
        <button
          onClick={() => router.push('/dashboard/results/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Record New Results
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Terms</option>
              {terms.map((term) => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
            
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No results found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Term/Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{result.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{result.className}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{result.term}</div>
                      <div className="text-xs text-gray-500">{result.academicYear}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{result.averageScore.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{result.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/dashboard/results/${result.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </button>
                      {result.status === 'draft' && (
                        <button
                          onClick={() => router.push(`/dashboard/results/${result.id}/edit`)}
                          className="text-yellow-600 hover:text-yellow-900 mr-4"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/dashboard/results/${result.id}/print`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-2">Generate Report Cards</h4>
            <p className="text-sm text-gray-500 mb-4">Generate report cards for an entire class at once.</p>
            <button
              onClick={() => router.push('/dashboard/results/generate-report-cards')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              Generate Report Cards
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-2">Class Performance Analysis</h4>
            <p className="text-sm text-gray-500 mb-4">View detailed performance analytics for each class.</p>
            <button
              onClick={() => router.push('/dashboard/results/class-analysis')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              View Analysis
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium mb-2">Subject Performance</h4>
            <p className="text-sm text-gray-500 mb-4">Analyze performance across different subjects.</p>
            <button
              onClick={() => router.push('/dashboard/results/subject-analysis')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Subject Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}