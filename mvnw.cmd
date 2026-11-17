@echo off
set "MAVEN_EXEC=C:\Users\DieuKhongNgu\.m2\wrapper\dists\apache-maven-3.9.16\56ba1f9f\bin\mvn.cmd"
if exist "%MAVEN_EXEC%" (
    call "%MAVEN_EXEC%" %*
) else (
    mvn %*
)
