rem netstat -ano | find "80"
taskkill /im node.exe

cd %~dp0

node index.js
