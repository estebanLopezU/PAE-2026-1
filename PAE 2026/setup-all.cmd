@echo off
rem Lanzador de doble clic para instalar todas las dependencias del proyecto
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-all.ps1"
pause
