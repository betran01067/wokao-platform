'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Course } from '@/lib/types'
import { Search, CheckCircle2, BookOpen } from 'lucide-react'

export default function OnboardingPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    fetchCourses()
  }, [user, router])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name')

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleSubmit = async () => {
    if (!user || selectedCourses.length === 0) return

    setSaving(true)
    try {
      const semester = '2025-2026-2'
      
      const userCourses = selectedCourses.map(courseId => ({
        user_id: user.id,
        course_id: courseId,
        semester,
      }))

      const { error } = await supabase
        .from('user_courses')
        .insert(userCourses)

      if (error) throw error

      alert('选课成功！即将跳转到首页')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving courses:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <BookOpen className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">选择本学期课程</h1>
          <p className="mt-2 text-gray-600">
            选择您本学期选修的课程，以便我们为您推送相关的验证任务和真题推荐
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索课程名称或编号..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              已选择 {selectedCourses.length} 门课程
            </h2>
            <button
              onClick={() => setSelectedCourses([])}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              清空选择
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">加载中...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => toggleCourse(course.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCourses.includes(course.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{course.name}</h3>
                      {course.code && (
                        <p className="text-sm text-gray-500 mt-1">{course.code}</p>
                      )}
                    </div>
                    {selectedCourses.includes(course.id) && (
                      <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredCourses.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              未找到匹配的课程
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={selectedCourses.length === 0 || saving}
            className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '保存中...' : `确认选择 (${selectedCourses.length} 门课程)`}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            稍后添加课程
          </button>
        </div>
      </div>
    </div>
  )
}
