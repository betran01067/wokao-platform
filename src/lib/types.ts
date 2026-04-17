export interface Course {
  id: string
  name: string
  code: string | null
  created_at: string
}

export interface Teacher {
  id: string
  name: string
  created_at: string
}

export interface CourseTeacher {
  course_id: string
  teacher_id: string
}

export interface Profile {
  id: string
  nickname: string | null
  avatar_url: string | null
  credits: number
  created_at: string
}

export interface UserCourse {
  user_id: string
  course_id: string
  semester: string
}

export type ExamStatus = 'pending' | 'verified' | 'fake'
export type ExamType = '期中' | '期末' | '小测'
export type Semester = '上学期' | '下学期'

export interface Exam {
  id: string
  uploader_id: string
  course_id: string
  teacher_ids: string[]
  year: number
  semester: Semester
  exam_type: ExamType
  images: string[]
  status: ExamStatus
  vote_true: number
  vote_false: number
  created_at: string
  courses?: Course
  teachers?: Teacher[]
}

export interface Vote {
  id: string
  exam_id: string
  voter_id: string
  is_true: boolean
  reason: string
  created_at: string
}
