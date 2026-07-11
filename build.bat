@echo off
echo Building frontend...
cd frontend
call npm install
call npm run build

echo Copying to backend/static...
rmdir /s /q ..\backend\static
xcopy /E /I dist ..\backend\static

echo Build complete!