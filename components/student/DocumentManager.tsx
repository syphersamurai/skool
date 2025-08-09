'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface DocumentManagerProps {
  studentId: string;
}

interface Document {
  id: string;
  name: string;
  url: string;
  createdAt: any;
}

export default function DocumentManager({ studentId }: DocumentManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const q = query(collection(db, `students/${studentId}/documents`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Document[];
      setDocuments(docs);
    });
    return () => unsubscribe();
  }, [studentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `students/${studentId}/documents/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await addDoc(collection(db, `students/${studentId}/documents`), {
            name: file.name,
            url: downloadURL,
            createdAt: new Date(),
          });
          setUploading(false);
          setFile(null);
        });
      }
    );
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <input type="file" onChange={handleFileChange} className="border rounded-md p-2" />
        <button onClick={handleUpload} disabled={!file || uploading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
          {uploading ? `Uploading... ${progress.toFixed(0)}%` : 'Upload'}
        </button>
      </div>
      <div>
        <h4 className="font-medium mb-2">Uploaded Documents:</h4>
        <ul className="list-disc pl-5">
          {documents.map(doc => (
            <li key={doc.id}>
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                {doc.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
