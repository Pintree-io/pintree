@echo off
setlocal enabledelayedexpansion

:: 获取当前用户名
for /F "tokens=*" %%i in ('whoami') do set "username=%%i"

:: 获取AppData目录路径
set "appdataPath=C:\Users\%username%\AppData\Local\google\Chrome\User Data\Default\"

:: 输出选项
echo 请选择一个选项：
echo 1. 将文件 %appdataPath%\Bookmarks 复制到当前目录并命名为 pintree.json
echo 2. 将当前目录的 .\json\pintree.json 文件覆盖 %appdataPath%\Bookmarks 文件

set /p choice=请输入选项编号（1或2）：

if "%choice%"=="1" (
    copy "%appdataPath%\Bookmarks" "%cd%\json\pintree.json"
    echo 文件已复制并命名为 pintree.json
) else if "%choice%"=="2" (
    copy "%cd%\json\pintree.json" "%appdataPath%\Bookmarks"
    echo 文件已覆盖 %appdataPath%\Bookmarks
) else (
    echo 无效的选项
)

endlocal
pause