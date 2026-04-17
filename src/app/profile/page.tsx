'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import { Exam, Vote, Course, UserCourse } from '@/lib/types'
import { User, BookOpen, Upload, Award, CreditCard, Plus, X, CheckCircle2, XCircle, Clock } from 'lucide-react'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('uploads')
  const [myExams, setMyExams] = useState<Exam[]>([])
  const [myVotes, setMyVotes] = useState<any[]>([])
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [selectedNewCourse, setSelectedNewCourse] = useState('')
  
  const { user, profile, refreshProfile } = useAuth()
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
      const [examsRes, votesRes, userCoursesRes, allCoursesRes] = await Promise.all([
        supabase
          .from('exams')
          .select('*')
          .eq('uploader_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('votes')
          .select('*, exams(*)')
          .eq('voter_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_courses')
          .select('course_id, courses(*)')
          .eq('user_id', user.id),
        supabase
          .from('courses')
          .select('*')
          .order('name'),
      ])

      if (examsRes.data) setMyExams(examsRes.data)
      if (votesRes.data) setMyVotes(votesRes.data)
      if (userCoursesRes.data) {
        const courses = userCoursesRes.data.map((uc: any) => uc.courses).filter(Boolean)
        setMyCourses(courses)
      }
      if (allCoursesRes.data) setAllCourses(allCoursesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCourse = async (courseId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_courses')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId)

      if (error) throw error

      setMyCourses(prev => prev.filter(c => c.id !== courseId))
    } catch (error) {
      console.error('Error removing course:', error)
      alert('删除失败，请重试')
    }
  }

  const handleAddCourse = async () => {
    if (!user || !selectedNewCourse) return

    try {
      const { error } = await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: selectedNewCourse,
          semester: '2025-2026-2',
        })

      if (error) throw error

      const course = allCourses.find(c => c.id === selectedNewCourse)
      if (course) {
        setMyCourses(prev => [...prev, course])
      }
      setShowAddCourse(false)
      setSelectedNewCourse('')
    } catch (error) {
      console.error('Error adding course:', error)
      alert('添加失败，请重试')
    }
  }

  const updateNickname = async (newNickname: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nickname: newNickname })
        .eq('id', user.id)

      if (error) throw error
      await refreshProfile()
    } catch (error) {
      console.error('Error updating nickname:', error)
      alert('更新失败，请重试')
    }
  }

  const handleDeleteExam = async (examId: string, images: string[]) => {
    if (!user) return
    
    if (!confirm('确定要删除这道题目吗？删除后将无法恢复。')) {
      return
    }

    try {
      // 1. 首先删除数据库记录（关键操作）
      console.log('正在删除数据库记录...')
      const { error: deleteError } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId)
        .eq('uploader_id', user.id)

      if (deleteError) {
        console.error('数据库删除失败:', deleteError)
        throw deleteError
      }
      
      console.log('数据库记录删除成功！')

      // 2. 然后删除Storage中的图片（清理操作，即使失败也要继续）
      console.log('正在删除Storage中的图片...')
      for (const imageUrl of images) {
        if (!imageUrl) continue
        
        const urlParts = imageUrl.split('/')
        const fileName = urlParts.slice(urlParts.indexOf('exam-images') + 1).join('/')
        
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('exam-images')
            .remove([fileName])
          
          if (storageError) {
            console.error(`删除图片 ${fileName} 失败:`, storageError)
          } else {
            console.log(`图片 ${fileName} 删除成功`)
          }
        }
      }

      // 3. 更新UI列表
      setMyExams(prev => prev.filter(exam => exam.id !== examId))
      
      console.log('题目已成功从数据库和存储中删除')
      alert('题目已成功删除')
    } catch (error) {
      console.error('删除题目时出错:', error)
      alert('删除失败，请重试')
    }
  }

  const tabs = [
    { id: 'uploads', label: '我的上传', icon: Upload },
    { id: 'votes', label: '验证记录', icon: Award },
    { id: 'courses', label: '我的课程', icon: BookOpen },
  ]

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
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.nickname || '同学'}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">积分余额</p>
              <p className="text-3xl font-bold text-primary-600">{profile?.credits || 0}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              修改昵称
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                defaultValue={profile?.nickname || ''}
                placeholder="输入新昵称"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                id="nickname-input"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('nickname-input') as HTMLInputElement
                  if (input?.value) {
                    updateNickname(input.value)
                  }
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-6">
            {/* My Uploads */}
            {activeTab === 'uploads' && (
              <div>
                {myExams.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>暂无上传记录</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myExams.map((exam) => (
                      <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {exam.year} {exam.semester} {exam.exam_type}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            投票: {exam.vote_true} 真实 / {exam.vote_false} 虚假
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            提交于 {new Date(exam.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            exam.status === 'verified' 
                              ? 'bg-green-100 text-green-700'
                              : exam.status === 'fake'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {exam.status === 'verified' ? (
                              <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" />已验证</span>
                            ) : exam.status === 'fake' ? (
                              <span className="flex items-center"><XCircle className="w-3 h-3 mr-1" />虚假</span>
                            ) : (
                              <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />待验证</span>
                            )}
                          </span>
                          {exam.status === 'pending' && (
                            <button
                              onClick={() => handleDeleteExam(exam.id, exam.images)}
                              className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Votes */}
            {activeTab === 'votes' && (
              <div>
                {myVotes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>暂无验证记录</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myVotes.map((vote) => (
                      <div key={vote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {(vote.exams as any)?.year} {(vote.exams as any)?.semester} {(vote.exams as any)?.exam_type}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            理由: {vote.reason}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            投票于 {new Date(vote.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vote.is_true ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {vote.is_true ? '真实' : '虚假'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Courses */}
            {activeTab === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">我的课程</h3>
                  <button
                    onClick={() => setShowAddCourse(true)}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加课程
                  </button>
                </div>

                {myCourses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>暂无选课记录</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {myCourses.map((course) => (
                      <div key={course.id} className="relative p-4 bg-gray-50 rounded-lg">
                        <button
                          onClick={() => handleRemoveCourse(course.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <BookOpen className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900 text-center truncate">
                          {course.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Course Modal */}
        {showAddCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">添加课程</h3>
                <button
                  onClick={() => setShowAddCourse(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <select
                value={selectedNewCourse}
                onChange={(e) => setSelectedNewCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-4 text-gray-900 bg-white"
                style={{ color: '#111827' }}
              >
                <option value="" className="text-gray-900">选择课程</option>
                {allCourses
                  .filter(c => !myCourses.find(mc => mc.id === c.id))
                  .map((course) => (
                    <option key={course.id} value={course.id} className="text-gray-900">{course.name}</option>
                  ))}
              </select>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddCourse(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddCourse}
                  disabled={!selectedNewCourse}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
