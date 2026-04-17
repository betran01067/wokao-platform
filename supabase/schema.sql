-- 我考(Wokao) Database Schema

-- 1. 课程库（可从教务系统导入）
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 教师库
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 课程-教师关联（一门课可能有多个老师）
CREATE TABLE course_teachers (
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, teacher_id)
);

-- 4. 用户表（Supabase auth.users 已存在，这里建扩展信息）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  avatar_url TEXT,
  credits INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 用户-课程选课关系
CREATE TABLE user_courses (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  semester TEXT,
  PRIMARY KEY (user_id, course_id)
);

-- 6. 考题表（核心）
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID REFERENCES profiles(id) NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  teacher_ids UUID[] NOT NULL,
  year INT NOT NULL,
  semester TEXT,
  exam_type TEXT,
  images TEXT[] NOT NULL,
  status TEXT DEFAULT 'pending',
  vote_true INT DEFAULT 0,
  vote_false INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 投票记录表（防止重复投票+记录理由）
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES profiles(id) NOT NULL,
  is_true BOOLEAN NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, voter_id)
);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Courses: Anyone can read
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT USING (true);

-- Teachers: Anyone can read
CREATE POLICY "Teachers are viewable by everyone" ON teachers
  FOR SELECT USING (true);

-- Course teachers: Anyone can read
CREATE POLICY "Course teachers are viewable by everyone" ON course_teachers
  FOR SELECT USING (true);

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User courses: Users can view their own courses
CREATE POLICY "Users can view own courses" ON user_courses
  FOR SELECT USING (auth.uid() = user_id);

-- User courses: Users can insert their own courses
CREATE POLICY "Users can insert own courses" ON user_courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User courses: Users can delete their own courses
CREATE POLICY "Users can delete own courses" ON user_courses
  FOR DELETE USING (auth.uid() = user_id);

-- Exams: Anyone can view verified exams
CREATE POLICY "Anyone can view verified exams" ON exams
  FOR SELECT USING (status = 'verified');

-- Exams: Authenticated users can insert exams
CREATE POLICY "Authenticated users can insert exams" ON exams
  FOR INSERT WITH CHECK (auth.uid() = uploader_id);

-- Exams: Users with the same course can view pending exams (for voting)
CREATE POLICY "Same course users can view pending exams" ON exams
  FOR SELECT USING (
    status = 'pending' AND 
    EXISTS (
      SELECT 1 FROM user_courses 
      WHERE user_courses.user_id = auth.uid() 
      AND user_courses.course_id = exams.course_id
    )
  );

-- Exams: Users can delete their own exams (only pending status)
CREATE POLICY "Users can delete own exams" ON exams
  FOR DELETE USING (auth.uid() = uploader_id AND status = 'pending');

-- Votes: Users can view their own votes
CREATE POLICY "Users can view own votes" ON votes
  FOR SELECT USING (auth.uid() = voter_id);

-- Votes: Users can insert their own votes
CREATE POLICY "Users can insert own votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, credits)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nickname', 10);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update exam votes
CREATE OR REPLACE FUNCTION update_exam_votes()
RETURNS TRIGGER AS $$
DECLARE
  exam_record exams;
  vote_threshold INT := 10;
  true_threshold INT := 8;
  false_threshold INT := 6;
BEGIN
  -- Get the current exam record
  SELECT * INTO exam_record FROM exams WHERE id = NEW.exam_id;
  
  -- Count votes
  SELECT 
    COUNT(*) FILTER (WHERE is_true = true),
    COUNT(*) FILTER (WHERE is_true = false)
  INTO exam_record.vote_true, exam_record.vote_false
  FROM votes
  WHERE exam_id = NEW.exam_id;
  
  -- Check if we have enough votes
  IF (exam_record.vote_true + exam_record.vote_false) >= vote_threshold THEN
    IF exam_record.vote_true >= true_threshold THEN
      UPDATE exams SET status = 'verified', vote_true = exam_record.vote_true, vote_false = exam_record.vote_false WHERE id = NEW.exam_id;
      -- Award credits to uploader
      UPDATE profiles SET credits = credits + 20 WHERE id = exam_record.uploader_id;
    ELSIF exam_record.vote_false >= false_threshold THEN
      UPDATE exams SET status = 'fake', vote_true = exam_record.vote_true, vote_false = exam_record.vote_false WHERE id = NEW.exam_id;
    ELSE
      UPDATE exams SET vote_true = exam_record.vote_true, vote_false = exam_record.vote_false WHERE id = NEW.exam_id;
    END IF;
  ELSE
    UPDATE exams SET vote_true = exam_record.vote_true, vote_false = exam_record.vote_false WHERE id = NEW.exam_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update exam status after vote
CREATE TRIGGER on_vote_created
  AFTER INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION update_exam_votes();

-- Award credit to voter
CREATE OR REPLACE FUNCTION award_voter_credit()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET credits = credits + 1 WHERE id = NEW.voter_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_created_credit
  AFTER INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION award_voter_credit();

-- 插入示例课程
INSERT INTO courses (name, code) VALUES
  ('高等数学A', 'MATH101'),
  ('大学英语', 'ENG101'),
  ('计算机导论', 'CS101'),
  ('线性代数', 'MATH201'),
  ('概率论与数理统计', 'MATH301');

-- 插入示例教师
INSERT INTO teachers (name) VALUES
  ('张教授'),
  ('李老师'),
  ('王老师');

-- 将教师关联到课程
INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id FROM courses c, teachers t WHERE c.name = '高等数学A' AND t.name = '张教授';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id FROM courses c, teachers t WHERE c.name = '大学英语' AND t.name = '李老师';

