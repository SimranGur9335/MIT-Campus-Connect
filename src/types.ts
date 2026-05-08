export type UserRole = 'STUDENT' | 'FACULTY' | 'CLUB_HEAD' | 'ADMIN';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  department: string;
  createdAt: any;
  updatedAt: any;
}

export type Category = 'Academics' | 'Placements' | 'Sports' | 'Clubs' | 'Seminars' | 'Events' | 'Transport' | 'Emergency';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type AnnouncementStatus = 'pending' | 'published';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: Category;
  department: string;
  priority: Priority;
  status: AnnouncementStatus;
  expiresAt: any | null;
  authorId: string;
  authorName: string;
  imageUrl?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  read: boolean;
  createdAt: any;
}
