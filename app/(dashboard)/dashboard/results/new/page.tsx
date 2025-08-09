'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { studentsService, subjectsService, resultsService } from '@/lib/db';
import { Student, Subject, GRADING_SYSTEM } from '@/lib/types';

interface SubjectScore {
  subjectId: string;
  subjectName: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remarks: string;
}

export default function NewResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [academicYear, setAcademicYear] = useState('2023/2024');
  const [teacherRemarks, setTeacherRemarks] = useState('');
  const [principalRemarks, setPrincipalRemarks] = useState('');
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  
  // Data for dropdowns
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  
  // Mock data for classes, terms
  const classes = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];
  const terms = ['First Term', 'Second Term', 'Third Term'];
  const years = ['2023/2024', '2022/2023', '2021/2022'];

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const filtered = students.filter(student => student.class === selectedClass);
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedClass, students]);

  useEffect(() => {
    if (selectedStudent && subjects.length > 0) {
      // Initialize subject scores when student and subjects are selected
      const initialScores = subjects.map(subject => ({
        subjectId: subject.id,
        subjectName: subject.name,
        ca1: 0,
        ca2: 0,
        exam: 0,
        total: 0,
        grade: '',
        remarks: '',
      }));
      setSubjectScores(initialScores);
    }
  }, [selectedStudent, subjects]);

  async function fetchStudents() {
    try {
      const studentsList = await studentsService.getAll();
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }

  async function fetchSubjects() {
    try {
      const subjectsList = await subjectsService.getAll();
      setSubjects(subjectsList.map(s => ({ id: s.id, name: s.name, maxScore: 100 }))); // Assuming maxScore is 100 for all subjects
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }

  const getGradeAndRemarks = (totalScore: number) => {
    let grade = '';
    let remarks = '';

    for (const g in GRADING_SYSTEM) {
      const gradeRange = GRADING_SYSTEM[g as keyof typeof GRADING_SYSTEM];
      if (totalScore >= gradeRange.min && totalScore <= gradeRange.max) {
        grade = g;
        remarks = gradeRange.description;
        break;
      }
    }
    return { grade, remarks };
  };

  const handleScoreChange = (index: number, field: 'ca1' | 'ca2' | 'exam', value: string) => {
    const newValue = value === '' ? 0 : parseInt(value);
    
    const updatedScores = [...subjectScores];
    updatedScores[index] = {
      ...updatedScores[index],
      [field]: newValue,
    };
    
    // Calculate total and grade
    const ca1 = updatedScores[index].ca1;
    const ca2 = updatedScores[index].ca2;
    const exam = updatedScores[index].exam;
    const total = ca1 + ca2 + exam;
    
    const { grade, remarks } = getGradeAndRemarks(total);
    
    updatedScores[index] = {
      ...updatedScores[index],
      total,
      grade,
      remarks,
    };
    
    setSubjectScores(updatedScores);
  };

  const calculateTotalAndAverage = () => {
    const totalScore = subjectScores.reduce((sum, subject) => sum + subject.total, 0);
    const averageScore = subjectScores.length > 0 ? totalScore / subjectScores.length : 0;
    return { totalScore, averageScore };
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate form data
      if (!selectedClass) {
        throw new Error('Please select a class');
      }
      if (!selectedStudent) {
        throw new Error('Please select a student');
      }
      if (!selectedTerm) {
        throw new Error('Please select a term');
      }
      if (!academicYear) {
        throw new Error('Please enter an academic year');
      }

      // Validate scores
      for (const score of subjectScores) {
        if (score.ca1 < 0 || score.ca1 > 15) {
          throw new Error(`CA1 score for ${score.subjectName} must be between 0 and 15`);
        }
        if (score.ca2 < 0 || score.ca2 > 15) {
          throw new Error(`CA2 score for ${score.subjectName} must be between 0 and 15`);
        }
        if (score.exam < 0 || score.exam > 70) {
          throw new Error(`Exam score for ${score.subjectName} must be between 0 and 70`);
        }
      }

      const { totalScore, averageScore } = calculateTotalAndAverage();
      const selectedStudentData = students.find(s => s.id === selectedStudent);

      const resultData = {
        studentId: selectedStudent,
        studentName: selectedStudentData?.firstName + ' ' + selectedStudentData?.lastName || '',
        class: selectedClass,
        term: selectedTerm,
        academicYear,
        subjects: subjectScores.map(s => ({
          subjectName: s.subjectName,
          firstTest: s.ca1,
          secondTest: s.ca2,
          exam: s.exam,
          total: s.total,
          grade: s.grade,
          remarks: s.remarks,
        })),
        totalScore,
        averageScore,
        position: 0, // This would be calculated later based on class ranking
        totalStudents: 0, // This would be calculated later
        classAverage: 0, // This would be calculated later
        teacherComment: teacherRemarks,
        principalComment: principalRemarks,
        status,
      };
      
      await resultsService.create(resultData);
      
      setSuccess(true);
      
      // Redirect to the results list after a short delay
      setTimeout(() => {
        router.push('/dashboard/results');
      }, 2000);
    } catch (error) {
      console.error('Error adding result:', error);
      setError(error instanceof Error ? error.message : 'Failed to save result');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Record New Results</h2>
        <button
          onClick={() => router.push('/dashboard/results')}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          Results saved successfully! Redirecting...
        </div>
      )}

      <form className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Student Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Student Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
                  </label>
                  <select
                    id="class"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
                    Student *
                  </label>
                  <select
                    id="student"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    required
                    disabled={!selectedClass}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Select a student</option>
                    {filteredStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.admissionNumber})
                      </option>
                    ))}
                  </select>
                  {!selectedClass && (
                    <p className="mt-1 text-sm text-gray-500">Please select a class first</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Result Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">
                    Term *
                  </label>
                  <select
                    id="term"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {terms.map((term) => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year *
                  </label>
                  <select
                    id="academicYear"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Scores */}
          {selectedStudent && (
            <div>
              <h3 className="text-lg font-medium mb-4">Subject Scores</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CA1 (15%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CA2 (15%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam (70%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subjectScores.map((score, index) => (
                      <tr key={score.subjectId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {score.subjectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={score.ca1 || ''}
                            onChange={(e) => handleScoreChange(index, 'ca1', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={score.ca2 || ''}
                            onChange={(e) => handleScoreChange(index, 'ca2', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="70"
                            value={score.exam || ''}
                            onChange={(e) => handleScoreChange(index, 'exam', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {score.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${score.grade === 'A' ? 'bg-green-100 text-green-800' : score.grade === 'B' ? 'bg-blue-100 text-blue-800' : score.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : score.grade === 'D' || score.grade === 'E' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                            {score.grade || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {score.remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Total
                      </td>
                      <td colSpan={3} className="px-6 py-4 whitespace-nowrap"></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {calculateTotalAndAverage().totalScore}
                      </td>
                      <td colSpan={2} className="px-6 py-4 whitespace-nowrap"></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Average
                      </td>
                      <td colSpan={3} className="px-6 py-4 whitespace-nowrap"></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {calculateTotalAndAverage().averageScore.toFixed(2)}
                      </td>
                      <td colSpan={2} className="px-6 py-4 whitespace-nowrap"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Remarks */}
          {selectedStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="teacherRemarks" className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher's Remarks
                </label>
                <textarea
                  id="teacherRemarks"
                  value={teacherRemarks}
                  onChange={(e) => setTeacherRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter teacher's remarks..."
                />
              </div>

              <div>
                <label htmlFor="principalRemarks" className="block text-sm font-medium text-gray-700 mb-1">
                  Principal's Remarks
                </label>
                <textarea
                  id="principalRemarks"
                  value={principalRemarks}
                  onChange={(e) => setPrincipalRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter principal's remarks..."
                />
              </div>
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={loading}
              className={`px-4 py-2 ${loading ? 'bg-yellow-400' : 'bg-yellow-500 hover:bg-yellow-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'published')}
              disabled={loading}
              className={`px-4 py-2 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? 'Publishing...' : 'Save and Publish'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}