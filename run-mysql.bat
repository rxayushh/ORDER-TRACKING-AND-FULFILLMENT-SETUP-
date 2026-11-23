@echo off
title Local MySQL - Order Tracking
set "MYSQLD=%MYSQL_SERVER_PATH%"
if not defined MYSQLD (
    set "MYSQLD=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"
)
if not exist "%MYSQLD%" (
    echo MySQL server binary was not found at "%MYSQLD%".
    echo Install MySQL Server 8.x or set MYSQL_SERVER_PATH to mysqld.exe.
    pause
    exit /b 1
)
set "MYSQL_DATA_DIR=%LOCALAPPDATA%\OrderTrackingMySQL\data"
if not exist "%MYSQL_DATA_DIR%\ibdata1" (
    echo The local MySQL data directory was not initialized: "%MYSQL_DATA_DIR%"
    echo Configure a MySQL Windows service using the official installer, or initialize a local data directory first.
    pause
    exit /b 1
)
echo Starting local MySQL on 127.0.0.1:3306 using the existing data directory.
echo Keep this window open while the application is using MySQL.
"%MYSQLD%" --datadir="%MYSQL_DATA_DIR%" --port=3306 --bind-address=127.0.0.1 --console
pause
