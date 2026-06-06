export type UserRole = 'admin' | 'professor' | 'aluno';

export type FileType = 'pdf' | 'image' | 'video' | 'document' | 'spreadsheet' | 'presentation' | 'archive' | 'audio' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Password for login
  cpf?: string; // CPF/ID
  role: UserRole;
  turmaId?: string; // Only for students (single turma)
  turmaIds?: string[]; // Only for professors (multiple turmas)
  createdAt: string;
  enrollmentDate?: string; // Data de matrícula para alunos
  courseStartDate?: string; // Data de início do curso
  courseEndDate?: string; // Data de previsão de término
}

export interface Turma {
  id: string;
  name: string;
  description: string;
  professorId: string;
  createdAt: string;
}

export interface Material {
  id: string;
  turmaId: string;
  professorId: string;
  title: string;
  type: 'pdf' | 'video' | 'file';
  fileName?: string;
  fileType?: FileType;
  fileData?: string; // Base64 data for preview
  videoUrl?: string;
  uploadedAt: string;
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  turmaId: string;
  fileName: string;
  fileType?: FileType;
  fileData?: string; // Base64 data for download/preview
  submittedAt: string;
  status: 'pending' | 'reviewed';
}

export interface Payment {
  id: string;
  studentId: string;
  month: string; // Format: "2024-01"
  amount: number;
  status: 'paid' | 'pending';
  paidAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  turmaId?: string; // Optional: specific turma, or null for all
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  turmaId: string;
  date: string; // Format: "2026-01-15"
  professorId: string;
  records: { studentId: string; present: boolean }[];
  createdAt: string;
}

export interface MaterialProgress {
  id: string;
  studentId: string;
  materialId: string;
  completedAt: string;
}

export interface LMSData {
  users: User[];
  turmas: Turma[];
  materials: Material[];
  announcements: Announcement[];
  attendanceRecords: AttendanceRecord[];
  materialProgress: MaterialProgress[];
  submissions: StudentSubmission[];
  payments: Payment[];
}

// Helper to detect file type from extension
export function getFileTypeFromName(fileName: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  const typeMap: Record<string, FileType> = {
    // Documents
    'pdf': 'pdf',
    'doc': 'document',
    'docx': 'document',
    'txt': 'document',
    'rtf': 'document',
    'odt': 'document',
    // Images
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'webp': 'image',
    'svg': 'image',
    'bmp': 'image',
    // Videos
    'mp4': 'video',
    'avi': 'video',
    'mov': 'video',
    'wmv': 'video',
    'mkv': 'video',
    'webm': 'video',
    // Spreadsheets
    'xls': 'spreadsheet',
    'xlsx': 'spreadsheet',
    'csv': 'spreadsheet',
    'ods': 'spreadsheet',
    // Presentations
    'ppt': 'presentation',
    'pptx': 'presentation',
    'odp': 'presentation',
    // Audio
    'mp3': 'audio',
    'wav': 'audio',
    'ogg': 'audio',
    'flac': 'audio',
    'm4a': 'audio',
    // Archives
    'zip': 'archive',
    'rar': 'archive',
    '7z': 'archive',
    'tar': 'archive',
    'gz': 'archive',
  };
  
  return typeMap[ext] || 'other';
}
