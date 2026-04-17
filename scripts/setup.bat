@echo off
echo ========================================
echo 我考 (Wokao) - 项目设置脚本
echo ========================================
echo.

echo [1/3] 正在安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 安装依赖失败！
    pause
    exit /b 1
)

echo.
echo [2/3] 依赖安装完成！

echo.
echo [3/3] 检查环境变量配置...
if not exist ".env.local" (
    echo 警告: .env.local 文件不存在！
    echo 请按照 SETUP.md 中的说明创建该文件。
    echo.
    echo 需要的内容:
    echo NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    echo.
)

echo.
echo ========================================
echo 设置完成！
echo ========================================
echo.
echo 接下来的步骤:
echo 1. 配置 Supabase (参考 SETUP.md)
echo 2. 创建 .env.local 文件
echo 3. 运行 'npm run dev' 启动开发服务器
echo.
echo 是否立即启动开发服务器? (Y/N)
set /p choice=
if /i "%choice%"=="Y" goto start
if /i "%choice%"=="y" goto start
echo 好的，您可以随时运行 'npm run dev' 启动服务器。
pause
exit /b 0

:start
echo 启动开发服务器...
npm run dev
