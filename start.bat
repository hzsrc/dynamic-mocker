rem netstat -ano | find "80"
taskkill /im node.exe

%~d0
cd %~dp0

node run.js ./config.js
