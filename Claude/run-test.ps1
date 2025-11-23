# Start the server in the background
Write-Host "Starting server..." -ForegroundColor Green
$serverProcess = Start-Process -FilePath "node" -ArgumentList "dist/server.js" -PassThru -NoNewWindow

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Run the test
Write-Host "Running tests..." -ForegroundColor Green
node dist/test.js

# Kill the server process
Write-Host "Stopping server..." -ForegroundColor Yellow
Stop-Process -Id $serverProcess.Id -Force
Write-Host "Done!" -ForegroundColor Green
