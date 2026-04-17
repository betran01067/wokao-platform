'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import { Exam, Course, UserCourse } from '@/lib/types'
import { BookOpen, Award, TrendingUp, Upload, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [myExams, setMyExams] = useState<Exam[]>([])
  const [userCourses, setUserCourses] = useState<Course[]>([])
  const [recentExams, setRecentExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    fetchData()
  }, [user, router])

  const fetchData = async () => {
    if (!user) return

    try {
      const [coursesRes, examsRes, recentRes] = await Promise.all([
        supabase
          .from('user_courses')
          .select('course_id, courses(*)')
          .eq('user_id', user.id),
        supabase
          .from('exams')
          .select('*')
          .eq('uploader_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('exams')
          .select('*, courses(*)')
          .eq('status', 'verified')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      if (coursesRes.data) {
        const courses = coursesRes.data.map((uc: any) => uc.courses).filter(Boolean)
        setUserCourses(courses)
      }

      if (examsRes.data) setMyExams(examsRes.data)
      if (recentRes.data) setRecentExams(recentRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                欢迎回来，{profile?.nickname || '同学'}！
              </h1>
              <p className="text-gray-600 mt-1">
                您目前选修了 {userCourses.length} 门课程
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">当前积分</p>
              <p className="text-3xl font-bold text-primary-600">{profile?.credits || 0}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/upload">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-sm p-6 text-white hover:shadow-md transition-shadow cursor-pointer">
              <Upload className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-1">上传真题</h3>
              <p className="text-sm text-primary-100">
                分享本学期的考试题目，获得20积分奖励
              </p>
            </div>
          </Link>

          <Link href="/verify">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white hover:shadow-md transition-shadow cursor-pointer">
              <Award className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-1">验证任务</h3>
              <p className="text-sm text-green-100">
                帮助验证同学上传的题目，每题获得1积分
              </p>
            </div>
          </Link>

          <Link href="/search">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white hover:shadow-md transition-shadow cursor-pointer">
              <BookOpen className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-semibold mb-1">搜索真题</h3>
              <p className="text-sm text-blue-100">
                查找历年考试真题，助力复习备考
              </p>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">我的上传</p>
                <p className="text-2xl font-bold text-gray-900">{myExams.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">已验证</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myExams.filter(e => e.status === 'verified').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">待验证</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myExams.filter(e => e.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">我的课程</p>
                <p className="text-2xl font-bold text-gray-900">{userCourses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Exams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Uploads */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">我的上传</h2>
              <Link href="/profile" className="text-sm text-primary-600 hover:text-primary-700">
                查看全部
              </Link>
            </div>
            
            {myExams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>暂无上传记录</p>
                <Link href="/upload" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                  立即上传
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {exam.year} {exam.semester} {exam.exam_type}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        投票: {exam.vote_true} 真实 / {exam.vote_false} 虚假
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      exam.status === 'verified' 
                        ? 'bg-green-100 text-green-700'
                        : exam.status === 'fake'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {exam.status === 'verified' ? '已验证' : exam.status === 'fake' ? '虚假' : '待验证'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Verified Exams */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">最新真题</h2>
              <Link href="/search" className="text-sm text-primary-600 hover:text-primary-700">
                查看全部
              </Link>
            </div>
            
            {recentExams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>暂无已验证真题</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {(exam as any).courses?.name || '未知课程'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {exam.year} {exam.semester} {exam.exam_type}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      已验证
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Courses */}
        {userCourses.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">我的课程</h2>
              <Link href="/profile" className="text-sm text-primary-600 hover:text-primary-700">
                管理课程
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {userCourses.map((course) => (
                <div key={course.id} className="p-3 bg-gray-50 rounded-lg text-center">
                  <BookOpen className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 truncate" title={course.name}>
                    {course.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
