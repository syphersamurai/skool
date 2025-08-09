'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studentsService, subjectsService, resultsService } from '@/lib/db';
import { Student, Subject, GRADING_SYSTEM } from '@/lib/types';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SubjectScoreInput {
  subjectId: string;
  subjectName: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remarks: string;
}

interface StudentResultInput {
  studentId: string;
  studentName: string;
  scores: SubjectScoreInput[];
}

export default function BulkResultEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [academicYear, setAcademicYear] = useState('2023/2024');

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentResults, setStudentResults] = useState<StudentResultInput[]>([]);

  const classes = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'];
  const terms = ['First Term', 'Second Term', 'Third Term'];
  const years = ['2023/2024', '2022/2023', '2021/2022'];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const subjectsList = await subjectsService.getAll();
        setSubjects(subjectsList.map(s => ({ id: s.id, name: s.name, maxScore: 100 })));
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchStudentsForClass() {
      if (selectedClass) {
        setLoading(true);
        try {
          const studentsList = await studentsService.getWhere('class', '==', selectedClass);
          setStudents(studentsList);
          // Initialize student results structure
          setStudentResults(studentsList.map(student => ({
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            scores: subjects.map(subject => ({
              subjectId: subject.id,
              subjectName: subject.name,
              ca1: 0,
              ca2: 0,
              exam: 0,
              total: 0,
              grade: '',
              remarks: '',
            })),
          })));
        } catch (err) {
          console.error('Error fetching students for class:', err);
          setError('Failed to load students for selected class.');
        } finally {
          setLoading(false);
        }
      } else {
        setStudents([]);
        setStudentResults([]);
      }
    }
    fetchStudentsForClass();
  }, [selectedClass, subjects]);

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

  const handleScoreChange = (studentIndex: number, subjectIndex: number, field: 'ca1' | 'ca2' | 'exam', value: string) => {
    const newValue = value === '' ? 0 : parseInt(value);
    
    setStudentResults(prevResults => {
      const newResults = [...prevResults];
      const student = { ...newResults[studentIndex] };
      const subject = { ...student.scores[subjectIndex] };

      subject[field] = newValue;

      const total = subject.ca1 + subject.ca2 + subject.exam;
      const { grade, remarks } = getGradeAndRemarks(total);

      subject.total = total;
      subject.grade = grade;
      subject.remarks = remarks;

      student.scores[subjectIndex] = subject;
      newResults[studentIndex] = student;
      return newResults;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const batch = writeBatch(db);

      for (const studentResult of studentResults) {
        const totalScore = studentResult.scores.reduce((sum, s) => sum + s.total, 0);
        const averageScore = studentResult.scores.length > 0 ? totalScore / studentResult.scores.length : 0;

        const resultData = {
          studentId: studentResult.studentId,
          studentName: studentResult.studentName,
          class: selectedClass,
          term: selectedTerm,
          academicYear,
          subjects: studentResult.scores.map(s => ({
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
          position: 0, // Will be calculated later
          totalStudents: students.length, // Total students in class
          classAverage: 0, // Will be calculated later
          teacherComment: '', // Can be added later
          principalComment: '', // Can be added later
          status: 'draft', // Default to draft
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const newDocRef = doc(collection(db, resultsService.collectionName));
        batch.set(newDocRef, resultData);
      }

      await batch.commit();
      setSuccess(true);
      alert('Bulk results saved successfully!');
      router.push('/dashboard/results');
    } catch (err) {
      console.error('Error saving bulk results:', err);
      setError('Failed to save bulk results.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Bulk Result Entry</h2>
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
          Bulk results saved successfully!
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Select Class and Term</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700">Class</label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="term" className="block text-sm font-medium text-gray-700">Term</label>
            <select
              id="term"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {terms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">Academic Year</label>
            <select
              id="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedClass && students.length > 0 && subjects.length > 0 && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Enter Scores</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  {subjects.map(subject => (
                    <th key={subject.id} colSpan={4} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                      {subject.name}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  {subjects.map(subject => (
                    <>
                      <th key={`${subject.id}-ca1`} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CA1</th>
                      <th key={`${subject.id}-ca2`} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CA2</th>
                      <th key={`${subject.id}-exam`} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                      <th key={`${subject.id}-total`} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Total</th>
                    </>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentResults.map((studentResult, studentIndex) => (
                  <tr key={studentResult.studentId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {studentResult.studentName}
                    </td>
                    {studentResult.scores.map((score, subjectIndex) => (
                      <>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={score.ca1 || ''}
                            onChange={(e) => handleScoreChange(studentIndex, subjectIndex, 'ca1', e.target.value)}
                            className="w-16 px-1 py-1 border rounded-md text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={score.ca2 || ''}
                            onChange={(e) => handleScoreChange(studentIndex, subjectIndex, 'ca2', e.target.value)}
                            className="w-16 px-1 py-1 border rounded-md text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="70"
                            value={score.exam || ''}
                            onChange={(e) => handleScoreChange(studentIndex, subjectIndex, 'exam', e.target.value)}
                            className="w-16 px-1 py-1 border rounded-md text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                          {score.total}
                        </td>
                      </>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {saving ? 'Saving...' : 'Save All Results'}
            </button>
          </div>
        </form>
      )}

      {selectedClass && (students.length === 0 || subjects.length === 0) && !loading && (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          {students.length === 0 ? 'No students found in this class.' : 'No subjects available.'}
        </div>
      )}
    </div>
  );
}
