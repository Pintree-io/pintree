@echo off
set source=C:\Users\Administrator\AppData\Local\google\Chrome\User Data\Default\Bookmarks
set destination=D:\Unity\Projects\pintree\json
set newname=pintree.json
 
copy "%source%" "%destination%\%newname%"