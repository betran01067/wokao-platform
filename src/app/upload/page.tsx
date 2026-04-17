'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import { Course, Teacher, ExamType, Semester } from '@/lib/types'
import { Upload as UploadIcon, X, Search, AlertCircle } from 'lucide-react'

export default function UploadPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([])
  const [year, setYear] = useState(2025)
  const [semester, setSemester] = useState<Semester>('上学期')
  const [examType, setExamType] = useState<ExamType>('期末')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [courseSearch, setCourseSearch] = useState('')
  const [teacherSearch, setTeacherSearch] = useState('')
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  
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

  const fetchTeachers = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_teachers')
        .select('teacher_id, teachers(*)')
        .eq('course_id', courseId)

      if (error) throw error
      
      const teacherList = data?.map((ct: any) => ct.teachers).filter(Boolean) || []
      setTeachers(teacherList)
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.code?.toLowerCase().includes(courseSearch.toLowerCase())
  )

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(teacherSearch.toLowerCase())
  )

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course)
    setSelectedTeachers([])
    setShowCourseDropdown(false)
    setCourseSearch('')
    fetchTeachers(course.id)
  }

  const handleTeacherToggle = (teacher: Teacher) => {
    setSelectedTeachers(prev =>
      prev.find(t => t.id === teacher.id)
        ? prev.filter(t => t.id !== teacher.id)
        : [...prev, teacher]
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (images.length + files.length > 9) {
      alert('最多只能上传9张图片')
      return
    }

    setImages(prev => [...prev, ...files])

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const previewToRemove = imagePreviews[index]
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove)
    }
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !selectedCourse || selectedTeachers.length === 0 || images.length === 0) {
      alert('请填写所有必填项')
      return
    }

    setUploading(true)
    
    try {
      const imageUrls: string[] = []
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const fileExt = image.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`
        
        console.log(`上传图片 ${i + 1}/${images.length}:`, image.name)
        
        const { data, error } = await supabase.storage
          .from('exam-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error(`图片 ${i + 1} 上传失败:`, error)
          alert(`图片 ${i + 1} 上传失败: ${error.message}`)
          setUploading(false)
          return
        }

        console.log(`图片 ${i + 1} 上传成功, Storage路径:`, fileName)
        
        const { data: urlData } = supabase.storage
          .from('exam-images')
          .getPublicUrl(fileName)
        
        console.log(`图片 ${i + 1} 公开URL:`, urlData.publicUrl)
        imageUrls.push(urlData.publicUrl)
      }

      console.log('准备插入数据库，所有图片URL:', imageUrls)

      const { error: insertError } = await supabase
        .from('exams')
        .insert({
          uploader_id: user.id,
          course_id: selectedCourse.id,
          teacher_ids: selectedTeachers.map(t => t.id),
          year,
          semester,
          exam_type: examType,
          images: imageUrls,
          status: 'pending',
        })

      if (insertError) {
        console.error('数据库插入失败:', insertError)
        throw insertError
      }

      console.log('数据库插入成功！')
      alert('上传成功！待同课程同学验证通过后将获得20积分奖励')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting exam:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
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
      
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">上传真题</h1>
          <p className="mt-2 text-gray-600">
            分享您的考试题目，帮助其他同学复习备考
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start space-x-2 mb-6 p-4 bg-blue-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">温馨提示</p>
              <p className="mt-1">上传的题目需要经过同课程同学的投票验证。验证通过后可获得20积分奖励。</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程名称 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={selectedCourse ? selectedCourse.name : courseSearch}
                    onChange={(e) => {
                      if (!selectedCourse) {
                        setCourseSearch(e.target.value)
                        setShowCourseDropdown(true)
                      }
                    }}
                    onFocus={() => !selectedCourse && setShowCourseDropdown(true)}
                    placeholder="搜索课程..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    style={{ color: selectedCourse ? '#111827' : undefined }}
                  />
                  {selectedCourse && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourse(null)
                        setTeachers([])
                        setSelectedTeachers([])
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {showCourseDropdown && !selectedCourse && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCourses.length === 0 ? (
                      <div className="p-3 text-gray-500">未找到课程</div>
                    ) : (
                      filteredCourses.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => handleCourseSelect(course)}
                          className="p-3 hover:bg-gray-50 cursor-pointer text-gray-900"
                        >
                          <p className="font-medium text-gray-900">{course.name}</p>
                          {course.code && (
                            <p className="text-sm text-gray-500">{course.code}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Teacher Selection */}
            {selectedCourse && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  任课教师 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={teacherSearch}
                      onChange={(e) => {
                        setTeacherSearch(e.target.value)
                        setShowTeacherDropdown(true)
                      }}
                      onFocus={() => setShowTeacherDropdown(true)}
                      placeholder="搜索教师..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                      style={{ color: '#111827' }}
                    />
                  </div>

                  {showTeacherDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredTeachers.length === 0 ? (
                        <div className="p-3 text-gray-500">未找到教师</div>
                      ) : (
                        filteredTeachers.map((teacher) => (
                          <div
                            key={teacher.id}
                            onClick={() => handleTeacherToggle(teacher)}
                            className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-gray-900 ${
                              selectedTeachers.find(t => t.id === teacher.id) ? 'bg-primary-50' : ''
                            }`}
                          >
                            <span className="font-medium text-gray-900">{teacher.name}</span>
                            {selectedTeachers.find(t => t.id === teacher.id) && (
                              <span className="text-primary-600">✓</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {selectedTeachers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTeachers.map((teacher) => (
                      <span
                        key={teacher.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                      >
                        {teacher.name}
                        <button
                          type="button"
                          onClick={() => handleTeacherToggle(teacher)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Year and Semester */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  考试年份 <span className="text-red-500">*</span>
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  style={{ color: '#111827' }}
                >
                  {[2024, 2025, 2026].map((y) => (
                    <option key={y} value={y} className="text-gray-900">{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学期 <span className="text-red-500">*</span>
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as Semester)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  style={{ color: '#111827' }}
                >
                  <option value="上学期" className="text-gray-900">上学期</option>
                  <option value="下学期" className="text-gray-900">下学期</option>
                </select>
              </div>
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                考试类型 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                {(['期中', '期末', '小测'] as ExamType[]).map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="examType"
                      value={type}
                      checked={examType === type}
                      onChange={(e) => setExamType(e.target.value as ExamType)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                题目图片 <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-2">(最多9张，支持JPG/PNG)</span>
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>上传图片</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/jpeg,image/png"
                        multiple
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">或拖拽文件到此处</p>
                  </div>
                </div>
              </div>

              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={uploading || !selectedCourse || selectedTeachers.length === 0 || images.length === 0}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? '上传中...' : '提交审核'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
