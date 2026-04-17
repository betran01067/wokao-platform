'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import { Exam, Course, ExamType } from '@/lib/types'
import { Search, Filter, CheckCircle2, ThumbsUp, ThumbsDown, Lock, X } from 'lucide-react'

export default function SearchPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedSemester, setSelectedSemester] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [viewing, setViewing] = useState(false)
  const [credits, setCredits] = useState(0)
  
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    fetchCourses()
    fetchExams()
    setCredits(profile?.credits || 0)
  }, [user, profile, router])

  const fetchCourses = async () => {
    try {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .order('name')
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchExams = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('exams')
        .select('*, courses(*)')
        .eq('status', 'verified')
        .order('created_at', { ascending: false })
        .limit(50)

      if (searchQuery) {
        query = query.ilike('courses.name', `%${searchQuery}%`)
      }

      if (selectedCourse) {
        query = query.eq('course_id', selectedCourse)
      }

      if (selectedYear) {
        query = query.eq('year', parseInt(selectedYear))
      }

      if (selectedSemester) {
        query = query.eq('semester', selectedSemester)
      }

      if (selectedType) {
        query = query.eq('exam_type', selectedType)
      }

      const { data, error } = await query

      if (error) throw error
      setExams(data || [])
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [searchQuery, selectedCourse, selectedYear, selectedSemester, selectedType])

  const handleViewExam = async (exam: Exam) => {
    if (!user) return

    if (credits < 5) {
      alert('积分不足！查看详情需要5积分，您目前有' + credits + '积分')
      return
    }

    setViewing(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: credits - 5 })
        .eq('id', user.id)

      if (error) throw error

      setCredits(credits - 5)
      await refreshProfile()
      setSelectedExam(exam)
    } catch (error) {
      console.error('Error deducting credits:', error)
      alert('操作失败，请重试')
      setViewing(false)
    }
  }

  const handleRateExam = async (examId: string, isUseful: boolean) => {
    // Simple rating system - in production, you'd want to track this properly
    alert('感谢您的评价！')
  }

  const clearFilters = () => {
    setSelectedCourse('')
    setSelectedYear('')
    setSelectedSemester('')
    setSelectedType('')
    setSearchQuery('')
  }

  const hasFilters = selectedCourse || selectedYear || selectedSemester || selectedType || searchQuery

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">搜索真题</h1>
          <p className="text-gray-600">
            查找历年考试真题，查看详情需要消耗5积分
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索课程名称..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center ${
                showFilters ? 'bg-primary-50 border-primary-500 text-primary-600' : 'border-gray-300 text-gray-700'
              }`}
            >
              <Filter className="w-5 h-5 mr-2" />
              筛选
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">课程</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    style={{ color: '#111827' }}
                  >
                    <option value="" className="text-gray-900">全部课程</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id} className="text-gray-900">{course.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    style={{ color: '#111827' }}
                  >
                    <option value="" className="text-gray-900">全部年份</option>
                    {[2026, 2025, 2024].map((year) => (
                      <option key={year} value={year} className="text-gray-900">{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学期</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    style={{ color: '#111827' }}
                  >
                    <option value="" className="text-gray-900">全部学期</option>
                    <option value="上学期" className="text-gray-900">上学期</option>
                    <option value="下学期" className="text-gray-900">下学期</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">考试类型</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    style={{ color: '#111827' }}
                  >
                    <option value="" className="text-gray-900">全部类型</option>
                    <option value="期中" className="text-gray-900">期中</option>
                    <option value="期末" className="text-gray-900">期末</option>
                    <option value="小测" className="text-gray-900">小测</option>
                  </select>
                </div>
              </div>

              {hasFilters && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    清除筛选
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到真题</h3>
            <p className="text-gray-600">尝试调整搜索条件或筛选条件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {(exam as any).courses?.name || '未知课程'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {exam.year} {exam.semester} {exam.exam_type}
                    </p>
                  </div>
                  <span className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    已验证
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  投票：{exam.vote_true} 真实 / {exam.vote_false} 虚假
                </div>

                <button
                  onClick={() => handleViewExam(exam)}
                  disabled={viewing}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  查看详情 (5积分)
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Exam Detail Modal */}
        {selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {(selectedExam as any).courses?.name || '未知课程'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedExam.year} {selectedExam.semester} {selectedExam.exam_type}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedExam(null)
                    setViewing(false)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {selectedExam.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`题目图片 ${index + 1}`}
                    className="w-full rounded-lg"
                  />
                ))}
              </div>

              <div className="border-t px-6 py-4 flex justify-between items-center">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleRateExam(selectedExam.id, true)}
                    className="flex items-center text-gray-600 hover:text-primary-600"
                  >
                    <ThumbsUp className="w-5 h-5 mr-1" />
                    有用
                  </button>
                  <button
                    onClick={() => handleRateExam(selectedExam.id, false)}
                    className="flex items-center text-gray-600 hover:text-red-600"
                  >
                    <ThumbsDown className="w-5 h-5 mr-1" />
                    无用
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
