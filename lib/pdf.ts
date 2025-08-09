import jsPDF from 'jspdf';

interface Student {
  id: string;
  name: string;
  class: string;
  admissionNumber: string;
  // Add other fields as needed
}

export const generateStudentIdCard = (student: Student) => {
  const doc = new jsPDF();

  // Add school logo (replace with your logo)
  // doc.addImage('/path/to/logo.png', 'PNG', 10, 10, 30, 30);

  doc.setFontSize(20);
  doc.text('School Name', 105, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.text('Student ID Card', 105, 30, { align: 'center' });

  // Add student photo (replace with actual photo)
  // doc.addImage('/path/to/student-photo.jpg', 'JPEG', 15, 40, 40, 40);

  doc.setFontSize(12);
  doc.text(`Name: ${student.name}`, 70, 50);
  doc.text(`Class: ${student.class}`, 70, 60);
  doc.text(`Admission No: ${student.admissionNumber}`, 70, 70);

  // Add a border
  doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10);

  doc.save(`StudentID-${student.id}.pdf`);
};
