@echo off
title Pushpa Automation & Robotics Web Server
echo ===================================================
echo Starting Pushpa Automation & Robotics Web Application
echo Local Server: http://localhost:8080
echo ===================================================

start http://localhost:8080
python -m http.server 8080
pause
