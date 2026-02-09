@echo off
cd /d %~dp0
call npm run build
start "Webshop Server" server.exe