@echo off
cd /d %~dp0
start "" "%~dp0Adatbazis\run.bat"
start "" "%~dp0Backend\run.bat"
call "%~dp0Webshop\run.bat"