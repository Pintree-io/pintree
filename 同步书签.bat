@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 获取当前用户名
echo.
echo 当前用户:%USERNAME%

:: 获取AppData目录路径
set targetPath=C:\Users\%USERNAME%\AppData\Local\google\Chrome\User Data\Default\Bookmarks
set sourcePath=%cd%\json\pintree.json

:: 输出选项
echo 请选择一个选项：
echo.
echo "1 %targetPath% 覆盖 %sourcePath%"
echo.
echo "2 %sourcePath% 覆盖 %targetPath%"

set /p choice=请输入选项编号（1或2）：

if "%choice%"=="1" (
    copy "%targetPath%" "%sourcePath%"
    echo 文件已复制 %sourcePath%
) else if "%choice%"=="2" (
    copy "%sourcePath%" "%targetPath%"
    echo 文件已覆盖 %appdataPath%
) else (
    echo 无效的选项
)

endlocal
pause