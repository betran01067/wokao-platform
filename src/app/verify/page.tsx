'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import { Exam } from '@/lib/types'
import { CheckCircle2, XCircle, Award, ChevronLeft, ChevronRight } from 'lucide-react'

export default function VerifyPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [votedExamIds, setVotedExamIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [reason, setReason] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [voteType, setVoteType] = useState<'true' | 'false' | null>(null)
  const [imageStates, setImageStates] = useState<Record<string, { loaded: boolean; error: boolean; retryCount: number }>>({})
  
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    fetchPendingExams()
    fetchVotedExams()
  }, [user, router])

  const fetchPendingExams = async () => {
    if (!user) return

    try {
      const { data: userCourses } = await supabase
        .from('user_courses')
        .select('course_id')
        .eq('user_id', user.id)

      if (!userCourses || userCourses.length === 0) {
        setLoading(false)
        return
      }

      const courseIds = userCourses.map(uc => uc.course_id)

      const { data, error } = await supabase
        .from('exams')
        .select('*, courses(*)')
        .eq('status', 'pending')
        .in('course_id', courseIds)
        .limit(20)

      if (error) throw error
      setExams(data || [])
    } catch (error) {
      console.error('Error fetching pending exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVotedExams = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('votes')
        .select('exam_id')
        .eq('voter_id', user.id)

      if (data) {
        setVotedExamIds(new Set(data.map(v => v.exam_id)))
      }
    } catch (error) {
      console.error('Error fetching voted exams:', error)
    }
  }

  const unvotedExams = exams.filter(exam => !votedExamIds.has(exam.id))
  const currentExam = unvotedExams[currentIndex]

  const handleVote = (isTrue: boolean) => {
    setVoteType(isTrue ? 'true' : 'false')
    setShowModal(true)
  }

  const submitVote = async () => {
    if (!user || !currentExam || !voteType || !reason.trim()) {
      alert('请填写投票理由')
      return
    }

    setVoting(true)
    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          exam_id: currentExam.id,
          voter_id: user.id,
          is_true: voteType === 'true',
          reason: reason.trim(),
        })

      if (error) throw error

      setVotedExamIds(prev => {
        const newSet = new Set(prev)
        newSet.add(currentExam.id)
        return newSet
      })
      setShowModal(false)
      setReason('')
      setVoteType(null)
      
      if (currentIndex >= unvotedExams.length - 1) {
        alert('恭喜！您已完成所有验证任务')
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      alert('投票失败，请重试')
    } finally {
      setVoting(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < unvotedExams.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleImageLoad = (examId: string, imageIndex: number) => {
    const key = `${examId}-${imageIndex}`
    setImageStates(prev => ({
      ...prev,
      [key]: { ...prev[key], loaded: true, error: false }
    }))
  }

  const handleImageError = (examId: string, imageIndex: number) => {
    const key = `${examId}-${imageIndex}`
    const currentState = imageStates[key] || { loaded: false, error: false, retryCount: 0 }
    
    setImageStates(prev => ({
      ...prev,
      [key]: { 
        ...currentState, 
        error: true,
        retryCount: currentState.retryCount || 0
      }
    }))
  }

  const handleImageRetry = (examId: string, imageIndex: number) => {
    const key = `${examId}-${imageIndex}`
    const currentState = imageStates[key] || { loaded: false, error: false, retryCount: 0 }
    setImageStates(prev => ({
      ...prev,
      [key]: { 
        loaded: false, 
        error: false, 
        retryCount: currentState.retryCount + 1 
      }
    }))
  }

  const getImageState = (examId: string, imageIndex: number) => {
    const key = `${examId}-${imageIndex}`
    return imageStates[key] || { loaded: false, error: false, retryCount: 0 }
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
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Award className="w-8 h-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">验证任务</h1>
          </div>
          <p className="text-gray-600">
            帮助验证同学上传的题目是否真实，每完成一次验证可获得1积分
          </p>
        </div>

        {unvotedExams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">太棒了！</h2>
            <p className="text-gray-600">您已完成所有验证任务，感谢您的贡献！</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              返回首页
            </button>
          </div>
        ) : currentExam ? (
          <>
            <div className="mb-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                剩余 {unvotedExams.length} 道题目待验证
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} / {unvotedExams.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === unvotedExams.length - 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {(currentExam as any).courses?.name || '未知课程'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {currentExam.year} {currentExam.semester} {currentExam.exam_type}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {currentExam.images.map((image, index) => {
                  const state = getImageState(currentExam.id, index)
                  const imageKey = `${currentExam.id}-${index}`
                  
                  return (
                    <div key={imageKey} className="relative">
                      {!state.loaded && !state.error && (
                        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                          <div className="text-gray-400">加载中...</div>
                        </div>
                      )}
                      {state.error ? (
                        <div className="w-full bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6">
                          <div className="text-gray-400 mb-3">⚠️ 图片加载失败</div>
                          <div className="text-xs text-gray-500 break-all mb-3 max-w-full overflow-hidden">{image}</div>
                          <button
                            onClick={() => handleImageRetry(currentExam.id, index)}
                            className="px-4 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                          >
                            重试加载
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            key={`${currentExam.id}-${index}-${state.retryCount}`}
                            src={image}
                            alt={`题目图片 ${index + 1}`}
                            className={`w-full rounded-lg max-h-[600px] object-contain ${state.loaded ? 'block' : 'hidden'}`}
                            onLoad={() => handleImageLoad(currentExam.id, index)}
                            onError={() => handleImageError(currentExam.id, index)}
                          />
                          {!state.loaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                              <div className="text-gray-400 animate-pulse">加载中...</div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        图片 {index + 1} / {currentExam.images.length}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  当前投票：{currentExam.vote_true} 真实 / {currentExam.vote_false} 虚假
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">您的判断</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleVote(true)}
                  className="flex flex-col items-center justify-center p-6 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-600 mb-2" />
                  <span className="text-lg font-medium text-green-700">真实 ✅</span>
                  <span className="text-sm text-gray-600 mt-1">这题我考过或见过</span>
                </button>

                <button
                  onClick={() => handleVote(false)}
                  className="flex flex-col items-center justify-center p-6 border-2 border-red-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                >
                  <XCircle className="w-12 h-12 text-red-600 mb-2" />
                  <span className="text-lg font-medium text-red-700">虚假 ❌</span>
                  <span className="text-sm text-gray-600 mt-1">这题是伪造的或不存在</span>
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* Vote Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                填写投票理由
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  您的判断：{voteType === 'true' ? '真实' : '虚假'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="请简要说明您的判断理由..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setReason('')
                    setVoteType(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={submitVote}
                  disabled={voting || !reason.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {voting ? '提交中...' : '确认投票'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
