'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, startAfter, where, deleteDoc, doc } from 'firebase/firestore';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  employeeId: string;
  gender: string;
  email: string;
  phone: string;
  department?: string;
  status: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchStaff();
  }, [roleFilter]);

  async function fetchStaff() {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from Firestore
      // For demo purposes, we'll use mock data
      const mockStaff: StaffMember[] = [
        {
          id: '1',
          name: 'Dr. Adebayo Johnson',
          role: 'Principal',
          employeeId: 'EMP001',
          gender: 'Male',
          email: 'adebayo.johnson@school.edu.ng',
          phone: '+2348012345678',
          department: 'Administration',
          status: 'active',
        },
        {
          id: '2',
          name: 'Mrs. Ngozi Okonkwo',
          role: 'Vice Principal',
          employeeId: 'EMP002',
          gender: 'Female',
          email: 'ngozi.okonkwo@school.edu.ng',
          phone: '+2348023456789',
          department: 'Administration',
          status: 'active',
        },
        {
          id: '3',
          name: 'Mr. Emmanuel Nwachukwu',
          role: 'Teacher',
          employeeId: 'EMP003',
          gender: 'Male',
          email: 'emmanuel.nwachukwu@school.edu.ng',
          phone: '+2348034567890',
          department: 'Mathematics',
          status: 'active',
        },
        {
          id: '4',
          name: 'Ms. Fatima Ibrahim',
          role: 'Teacher',
          employeeId: 'EMP004',
          gender: 'Female',
          email: 'fatima.ibrahim@school.edu.ng',
          phone: '+2348045678901',
          department: 'English',
          status: 'active',
        },
        {
          id: '5',
          name: 'Mr. Chinedu Eze',
          role: 'Teacher',
          employeeId: 'EMP005',
          gender: 'Male',
          email: 'chinedu.eze@school.edu.ng',
          phone: '+2348056789012',
          department: 'Science',
          status: 'active',
        },
        {
          id: '6',
          name: 'Mrs. Amina Mohammed',
          role: 'Bursar',
          employeeId: 'EMP006',
          gender: 'Female',
          email: 'amina.mohammed@school.edu.ng',
          phone: '+2348067890123',
          department: 'Finance',
          status: 'active',
        },
        {
          id: '7',
          name: 'Mr. Oluwaseun Adeleke',
          role: 'Librarian',
          employeeId: 'EMP007',
          gender: 'Male',
          email: 'oluwaseun.adeleke@school.edu.ng',
          phone: '+2348078901234',
          department: 'Library',
          status: 'active',
        },
        {
          id: '8',
          name: 'Mrs. Blessing Okafor',
          role: 'Counselor',
          employeeId: 'EMP008',
          gender: 'Female',
          email: 'blessing.okafor@school.edu.ng',
          phone: '+2348089012345',
          department: 'Guidance & Counseling',
          status: 'active',
        },
      ];

      // Apply role filter if not 'all'
      let filteredStaff = mockStaff;
      if (roleFilter !== 'all') {
        filteredStaff = mockStaff.filter(member => member.role === roleFilter);
      }

      setStaff(filteredStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter staff based on search term
  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Staff</h2>
        <button
          onClick={() => router.push('/dashboard/staff/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add New Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, ID, email, or department"
            className="w-full px-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="px-4 py-2 border rounded-md"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="Principal">Principal</option>
            <option value="Vice Principal">Vice Principal</option>
            <option value="Teacher">Teachers</option>
            <option value="Bursar">Bursar</option>
            <option value="Librarian">Librarian</option>
            <option value="Counselor">Counselor</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No staff members found. Try adjusting your filters or add a new staff member.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {member.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{member.email}</div>
                    <div className="text-xs">{member.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/dashboard/staff/${member.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/staff/${member.id}/edit`)}
                      className="text-yellow-600 hover:text-yellow-900 mr-4"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}