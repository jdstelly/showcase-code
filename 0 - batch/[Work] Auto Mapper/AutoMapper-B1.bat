@ECHO OFF
SetLocal EnableDelayedExpansion

REM ================================
REM ===== SCRIPT CONFIGURATION =====
REM ================================

REM NOTE: MUST BE CONFIGURED FOR EACH DOMAIN
REM NOTE: The config.txt within the CONFIG_PATH must also be populated with entries.

SET DOMAIN_ADDRESS="192.168.33.1"
SET CONFIG_PATH="\\%DOMAIN_ADDRESS%\SHARE\IT_Config"
SET LOG_PATH="%CONFIG_PATH%\Logs"

REM ================================
REM ===== SCRIPT CONFIGURATION =====
REM ================================

REM GLOBAL VARIABLES
SET PASS="FALSE"
SET SYSDRIVE=""
SET OLD_ROOT=""
SET EFF_USER=""

REM Retrieve system drive (Unlikely that it's not C:, but we'll still check.)
FOR /f "tokens=2 delims==" %%b IN ('wmic OS GET SystemDrive /VALUE') DO (
    SET SYSDRIVE=%%b
)

REM Check domain connection.
ECHO\
ECHO Checking domain connection..
>NUL PING %DOMAIN_ADDRESS% -n 1 -w 1000
IF ERRORLEVEL 1 (SET DOMAIN_CONNECTION="DISCONNECTED") ELSE (SET DOMAIN_CONNECTION="CONNECTED")
IF %DOMAIN_CONNECTION%=="DISCONNECTED" (
    ECHO Error - Workstation is not connected to the domain! Please check your network connection.
    call :RAISE_ERROR "Error - Failed to verify network drives. Workstation is not connected to the domain! Please check your network connection."
    GOTO:END
) ELSE (
    ECHO Connection verified^^!
)

REM Check if configuration file exists.
ECHO\
ECHO Looking for Global Configuration file..
IF NOT exist "%CONFIG_PATH%\config.txt" (
    ECHO Error - Failed to locate Global Configuration file. Please verify network connection, and that %CONFIG_PATH%\config.txt has not been deleted. Continuing..
    call :RAISE_ERROR "Error - Failed to locate drive configuration file. Please contact your IT Administrator."
    GOTO:END
) ELSE (
    ECHO Found config.txt^^!
)

REM ==================================== PRE-EXECUTION HOUSEKEEPING ====================================
REM This section exists to clean up residual files that may have been generated and abandoned from the last execution.
REM One example is if a user closes the authentication script before it can delete itself. We have to catch these on next execution to prevent build-up.

ECHO\
ECHO ==Cleaning environment..
ECHO\

REM Remove residual authentication scripts
FOR /f "tokens=* delims= " %%s IN ('dir /b /a-d "%SYSDRIVE%\Users\%USERNAME%\Documents" ^| find /i "authNetDrive"') DO (
    del "%SYSDRIVE%\Users\%USERNAME%\Documents\%%s"
    ECHO Deleting %%s..
)

REM Remove residual error notification scripts
FOR /f "tokens=* delims= " %%s IN ('dir /b /a-d "%SYSDRIVE%\Users\%USERNAME%\Documents" ^| find /i "raiseError"') DO (
    del "%SYSDRIVE%\Users\%USERNAME%\Documents\%%s"
    ECHO Deleting %%s..
)

REM ==================================== PRE-EXECUTION HOUSEKEEPING ====================================

REM ==================================== SHORTCUT CREATION ====================================
ECHO\
ECHO ==Handling shortcuts..
ECHO\

REM First shortcut pass looks for Globals
SET EFF_USER=global
ECHO Mapping %EFF_USER% shortcuts..
:SHORTCUT_CREATION

FOR /f "tokens=* delims= " %%i IN ('type "%CONFIG_PATH%\config.txt" ^| find /i "%EFF_USER%;shortcut;"') DO (
    echo %%i | >NUL find /i "EXAMPLE" &&SET "THIS_ENTRY=INVALID" ||SET "THIS_ENTRY=VALID"
    IF "!THIS_ENTRY!"=="VALID" (

        REM Declare shortcut variables for this iteration.
        SET PASS="FALSE"
        SET THIS_SHORTCUT=""
        
        REM Parse and assign shortcut variable from config entry.
        FOR /f "tokens=3 delims=;" %%a IN ("%%i") DO (
            SET THIS_SHORTCUT=%%a
        )

        REM Check if referenced shortcut exists and validate shortcut entry formatting. Validation necessary because '.lnk' doesn't appear in GUI.
        IF NOT exist "%CONFIG_PATH%\shortcuts\!THIS_SHORTCUT!" (
            IF NOT exist "%CONFIG_PATH%\shortcuts\!THIS_SHORTCUT!.lnk" (
                SET PASS="TRUE"
            ) ELSE (
                SET THIS_SHORTCUT=!THIS_SHORTCUT!.lnk
            )
        )

        REM Check if shortcut already on user desktop.
        IF !PASS!=="FALSE" (
            ECHO\
            ECHO Checking for !THIS_SHORTCUT! shortcut..
            dir /b /a-d "%SYSDRIVE%\Users\%USERNAME%\Desktop" | >NUL find /i "!THIS_SHORTCUT!" && SET PASS="TRUE" && Echo Found !THIS_SHORTCUT!^^!

        )

        REM Check if shortcut already on public desktop.
        IF !PASS!=="FALSE" (
            dir /b /a-d "%SYSDRIVE%\Users\Public\Desktop" | >NUL find /i "!THIS_SHORTCUT!" && SET PASS="TRUE" && Echo Found !THIS_SHORTCUT!^^!
        )

        REM Create the shortcut.
        IF !PASS!=="FALSE" (
            copy "%CONFIG_PATH%\shortcuts\!THIS_SHORTCUT!" "%SYSDRIVE%\Users\%USERNAME%\Desktop"
        ) 
    )
)

REM After the first pass, we make a second pass for the username.
IF "%EFF_USER%"=="global" (
    SET EFF_USER=%USERNAME%
    GOTO:SHORTCUT_CREATION
)

REM ==================================== SHORTCUT CREATION ====================================

REM ================================== LEGACY DRIVE REMOVAL ==================================
ECHO\
ECHO ==Looking for legacy drives..
ECHO\

FOR /f "tokens=* delims= " %%i IN ('type "%CONFIG_PATH%\config.txt" ^| find /i "legacy;"') DO (
    echo %%i | >NUL find /i "EXAMPLE" &&SET "THIS_ENTRY=INVALID" ||SET "THIS_ENTRY=VALID"
    IF "!THIS_ENTRY!"=="VALID" (

        REM Declare removal variables for this iteration.
        SET OLD_ROOT=""
        SET DRIVE_LETTER=""

        REM Parse and assign variables from config entry.
        FOR /f "tokens=2-3 delims=;" %%a IN ("%%i") DO (
            SET OLD_ROOT=%%a
        )

        REM Search for legacy drives
        FOR /f "tokens=* delims= " %%a IN ('net use ^| find /i !OLD_ROOT!') DO (
            echo Found legacy drive: %%a

            REM Parse and assign the drive letter from legacy drive entry
            FOR /f "tokens=2 delims= " %%q IN ("%%a") DO (
                SET DRIVE_LETTER=%%q
                ECHO !DRIVE_LETTER!
            )

            REM Remove legacy drive.
            net use !DRIVE_LETTER! /del

        )
    ) 
)

REM ================================== LEGACY DRIVE REMOVAL ==================================

REM ================================== NETWORK DRIVE MAPPING ==================================
ECHO\
ECHO ==Handling network drives..
ECHO\

REM First drive pass looks for Globals
SET EFF_USER=global
:DRIVE_MAPPING
ECHO Mapping %EFF_USER% drives..

FOR /f "tokens=* delims= " %%i IN ('type "%CONFIG_PATH%\config.txt" ^| find /i "%EFF_USER%;drive;"') DO (
    echo %%i | >NUL find /i "EXAMPLE" &&SET "THIS_ENTRY=INVALID" ||SET "THIS_ENTRY=VALID"
    IF "!THIS_ENTRY!"=="VALID" (

        REM Declare drive variables for this iteration.
        SET PASS="FALSE"
        SET DRIVE_LETTER=""
        SET DRIVE_PATH=""
        SET DRIVE_TYPE=""
        SET DRIVE_NAME=""
        SET DRIVE_HOST=""

        REM Parse and assign drive variables from config entry.
        FOR /f "tokens=1-6 delims=;" %%a IN ("%%i") DO (
            SET DRIVE_LETTER=%%c
            SET DRIVE_PATH=%%d
            SET DRIVE_TYPE=%%e
            SET DRIVE_NAME=%%f
        )

        REM Parse and assign host variable from DRIVE_PATH.
        FOR /f "tokens=2 delims=\" %%h IN ("!DRIVE_PATH!") DO (
            SET DRIVE_HOST=%%h
        )

        REM Check if entry DRIVE_PATH exists.
        IF "!DRIVE_TYPE!"=="OPEN" (
            IF NOT exist "!DRIVE_PATH!" (
                ECHO Error - Path does not exist. Please verify network connection, and that !DRIVE_PATH! has not been deleted. Continuing..
                SET PASS="TRUE"
            )
        )

        REM Check if entry is already connected.
        IF !PASS!=="FALSE" (
            net use | find /i !DRIVE_PATH! | find /i "OK" &&SET "DRIVE_STATUS=CONNECTED"||SET "DRIVE_STATUS=MISSING"
            IF "!DRIVE_STATUS!"=="CONNECTED" (
                SET PASS="TRUE"
            )
        )

        REM Check if entry is mapped, but disfunctional.
        IF !PASS!=="FALSE" (
            net use | find /i !DRIVE_PATH! &&SET "DRIVE_STATUS=UNAVAILABLE"||SET "DRIVE_STATUS=MISSING"
            IF "!DRIVE_STATUS!"=="UNAVAILABLE" (
                IF "!DRIVE_TYPE!"=="OPEN" (
                    ECHO Drive is present, but disconnected.
                    ECHO Please verify your network connection, then verify that the folder at !DRIVE_PATH! still exists. Continuing..
                    SET PASS="TRUE"
                )
            )
        )
        
        REM If a secured, disfunctional drive is detected (that has a config entry), clear the mapping to prep for remapping.
        IF !PASS!=="FALSE" (
            IF "!DRIVE_TYPE!"=="SECURE" (
                IF "!DRIVE_STATUS!"=="UNAVAILABLE" (
                    SET AUTH_DRIVE_LETTER=""
                    FOR /f "tokens=2 delims= " %%m IN ('net use ^| find /i "!DRIVE_HOST!"') DO (
                        SET AUTH_DRIVE_LETTER=%%m
                    )
                    net use !AUTH_DRIVE_LETTER! /del  
                    cmdkey /delete:!DRIVE_HOST!
                )
            )
        )

        REM Map the drive.
        IF !PASS!=="FALSE" (
            IF "!DRIVE_TYPE!"=="OPEN" (
                REM Simple mapping for unsecured drives
                ECHO Mapping !DRIVE_LETTER!: drive to path !DRIVE_PATH!.
                net use !DRIVE_LETTER!: !DRIVE_PATH! /p:yes || net use * !DRIVE_PATH! /p:yes || call :RAISE_ERROR "Failed to map drive at !DRIVE_PATH!. Ensure there aren't over 25 drives already attached."
            ) ELSE (
                REM User interface mapping for secured drives
                call :MAP_SECURED_DRIVE !DRIVE_LETTER! !DRIVE_PATH! !DRIVE_NAME!
            )
        ) 
    )
)

REM Second pass looks for user drives.
IF "%EFF_USER%"=="global" (
    SET EFF_USER=%USERNAME%
    GOTO:DRIVE_MAPPING
)
REM ================================== NETWORK DRIVE MAPPING ==================================

REM ====================================== DRIVE LOGGING ======================================
REM NOTE: This section, when enabled in config.txt, performs drive logging. By collecting the mapped drives from the user at the end of the script,
REM we can make more informed network drive migrations. This ensures that we know exactly what drives the user had mapped before we migrate network drives from one directory
REM to another using this script. Prevents suffering and user complaints.

REM Declare drive logging variable
SET DRIVE_LOGGING="DISABLED"

FOR /f "tokens=* delims= " %%i IN ('type "%CONFIG_PATH%\config.txt" ^| find /i "module;logging;"') DO (

    REM Parse status from logging config entry
    FOR /f "tokens=3 delims=;" %%a IN ("%%i") DO (
        SET DRIVE_LOGGING=%%a
        ECHO Drive Logging is !DRIVE_LOGGING!.
    )
)

IF "!DRIVE_LOGGING!"=="ENABLED" (
    CALL :LOG_DRIVES
)
REM ====================================== DRIVE LOGGING ======================================

REM =================================== FUNCTION DEFINITIONS =================================== 

REM --------------------------------------------------------------------
REM FUNCTION MAP_SECURED_DRIVE (DRIVE_LETTER, DRIVE_PATH, DRIVE_NAME)
REM --------------------------------------------------------------------
REM NOTE: This section looks really weird because we're writing a script within a script to achieve a certain behavior.
REM In order to get the window to "pop up" for the user when they log in, a new script must be launched. Therefore, we write and execute
REM a child script within our main script.
GOTO:END
:MAP_SECURED_DRIVE
REM Ensure the Documents folder wasn't somehow deleted
IF NOT exist "%SYSDRIVE%\Users\%USERNAME%\Documents" (
    REM If it was deleted, make it again.
    MKDIR "%SYSDRIVE%\Users\%USERNAME%\Documents" || call :RAISE_ERROR "Failed to access Documents folder. Please contact your IT Administrator."
)
REM Navigate to Documents
CD "%SYSDRIVE%\Users\%USERNAME%\Documents"
REM Set unique identifier so the correct child script is deleted after execution.
SET /a SUID=(%Random%)
REM Write child script to Documents folder.
echo @ECHO OFF > authNetDrive%SUID%.bat
echo SETLOCAL >> authNetDrive%SUID%.bat
echo color 0F >> authNetDrive%SUID%.bat
REM This looks confusing (and is) because it's ASCII art with a ton of nested character escapes.
echo ECHO  ___  ___ ___  _   _ _____   _  _ ___ _______      _____  ___ _  _____ >> authNetDrive%SUID%.bat
echo ECHO / __^^^|/ __/ _ \^^^| ^^^| ^^^| ^^^|_   _^^^| ^^^| \^^^| ^^^| __^^^|_   _\ \    / / _ \^^^| _ ^^^| ^^^|/ / __^^^| >> authNetDrive%SUID%.bat
echo ECHO \__ ^^^| (_^^^| (_) ^^^| ^^^|_^^^| ^^^| ^^^| ^^^|   ^^^| .` ^^^| _^^^|  ^^^| ^^^|  \ \/\/ ^^^| (_) ^^^|   ^^^| ' ^^^<\__ \ >> authNetDrive%SUID%.bat
echo ECHO ^^^|___/\___\___/ \___/  ^^^|_^^^|   ^^^|_^^^|\_^^^|___^^^| ^^^|_^^^|   \_/\_/ \___/^^^|_^^^|_^^^|_^^^|\_^^^|___/ >> authNetDrive%SUID%.bat
echo SET driveLetter=%~1%% >> authNetDrive%SUID%.bat
echo SET drivePath=%~2%% >> authNetDrive%SUID%.bat
echo SET driveName=%~3%% >> authNetDrive%SUID%.bat
echo ECHO\ >> authNetDrive%SUID%.bat
echo ECHO\ >> authNetDrive%SUID%.bat
echo ECHO === Hello, %%USERNAME%%. It looks like this workstation is missing your %%driveName%% drive. === >> authNetDrive%SUID%.bat
echo ECHO === Below, you will be prompted to enter your %%driveName%% credentials. === >> authNetDrive%SUID%.bat
echo ECHO\ >> authNetDrive%SUID%.bat
echo ECHO === INSTRUCTIONS === >> authNetDrive%SUID%.bat
echo ECHO\ >> authNetDrive%SUID%.bat
echo ECHO === **SPECIAL NOTE - The password field remains ENTIRELY BLANK as you type it. Windows forces this behavior. === >> authNetDrive%SUID%.bat
echo ECHO\ >> authNetDrive%SUID%.bat
echo ECHO === If you enter your credentials incorrectly, you will be prompted for them again. === >> authNetDrive%SUID%.bat
echo ECHO === If you've authorized this workstation before, you will be logged in automatically. === >> authNetDrive%SUID%.bat
echo ECHO === If you're having trouble logging in, contact your office manager or Scout Networks. === >> authNetDrive%SUID%.bat
echo ECHO === Upon successful login, the drive should remain authenticated in the future. === >> authNetDrive%SUID%.bat
echo ECHO === You should only see this message if your drive is missing, or your %%driveName%% password has changed. === >> authNetDrive%SUID%.bat
echo ECHO\ >> authNetDrive%SUID%.bat
echo pause >> authNetDrive%SUID%.bat
echo ECHO Checking %%driveName%% server connection.. >> authNetDrive%SUID%.bat
echo :authForm >> authNetDrive%SUID%.bat
echo ^>^NUL PING %DOMAIN_ADDRESS% -n 1 -w 1000  >> authNetDrive%SUID%.bat
echo IF ERRORLEVEL 1 ( >> authNetDrive%SUID%.bat
echo    ECHO Error. Workstation is not connected to the %%driveName%% server! >> authNetDrive%SUID%.bat
echo    ECHO Please check your network connection, then sign out and back in again. >> authNetDrive%SUID%.bat
echo    ECHO\ >> authNetDrive%SUID%.bat
echo    pause >> authNetDrive%SUID%.bat
echo    timeout 600 >> authNetDrive%SUID%.bat
echo    GOTO:end_AUTH >> authNetDrive%SUID%.bat
echo ) >> authNetDrive%SUID%.bat
echo ECHO\ >> authNetDrive%SUID%.bat
echo ECHO === Please enter your %%driveName%% credentials below === >> authNetDrive%SUID%.bat
echo ^2^>^NUL NET USE %%driveLetter:~0,-1%%: %%drivePath%% /savecred /p:yes ^|^| ^2^>^NUL NET USE * %%drivePath%% /savecred /p:yes >> authNetDrive%SUID%.bat
echo IF ERRORLEVEL 1 ( >> authNetDrive%SUID%.bat
echo     ECHO\ >> authNetDrive%SUID%.bat
echo     ECHO Failed to authenticate. Please try again. >> authNetDrive%SUID%.bat
echo     GOTO:authForm >> authNetDrive%SUID%.bat
echo ) ELSE ( >> authNetDrive%SUID%.bat
echo     ECHO\ >> authNetDrive%SUID%.bat
echo     ECHO Successfully authenticated with %%driveName%% server. Saving Credentials for future use.. >> authNetDrive%SUID%.bat
echo     ECHO\ >> authNetDrive%SUID%.bat
echo     ECHO   ^^^_^^^_^^^_  ^^^_  ^^^_^^^_        ^^^_^^^_^^^_  ^^^_^^^_^^^_ ^^^_^^^_^^^_^^^_^^^_   ^^^_^^^_^^^_^^^_^^^_   ^^^_^^^_  ^^^_^^^_   ^^^_   ^^^_^^^_^^^_ ^^^_^^^_^^^_ ^^^_^^^_^^^_ ^^^_^^^_^^^_  ^^^_    >> authNetDrive%SUID%.bat
echo     ECHO  ^^^/ ^^^_ ^^^\^^^| ^^^|^^^/ ^^^/  ^^^_^^^_^^^_  ^^^|   ^^^\^^^| ^^^_ ^^^\^^^_ ^^^_^^^\ ^^^\ ^^^/ ^^^/ ^^^_^^^_^^^| ^^^|  ^^^\^^^/  ^^^| ^^^/^^^_^^^\ ^^^| ^^^_ ^^^\ ^^^_ ^^^\ ^^^_^^^_^^^|   ^^^\^^^| ^^^|   >> authNetDrive%SUID%.bat
echo     ECHO ^^^| ^^^(^^^_^^^) ^^^| ^^^' ^^^<  ^^^|^^^_^^^_^^^_^^^| ^^^| ^^^|^^^) ^^^|   ^^^/^^^| ^^^| ^^^\ ^^^V ^^^/^^^| ^^^_^^^|  ^^^| ^^^|^^^\^^^/^^^| ^^^|^^^/ ^^^_ ^^^\^^^|  ^^^_^^^/  ^^^_^^^/ ^^^_^^^|^^^| ^^^|^^^) ^^^|^^^_^^^|   >> authNetDrive%SUID%.bat
echo     ECHO  ^^^\^^^_^^^_^^^_^^^/^^^|^^^_^^^|^^^\^^^_^^^\       ^^^|^^^_^^^_^^^_^^^/^^^|^^^_^^^|^^^_^^^\^^^_^^^_^^^_^^^| ^^^\^^^_^^^/ ^^^|^^^_^^^_^^^_^^^| ^^^|^^^_^^^|  ^^^|^^^_^^^/^^^_^^^/ ^^^\^^^_^^^\^^^_^^^| ^^^|^^^_^^^| ^^^|^^^_^^^_^^^_^^^|^^^_^^^_^^^_^^^/^^^(^^^_^^^)   >> authNetDrive%SUID%.bat
echo     ECHO\ >> authNetDrive%SUID%.bat
echo     ECHO Drive has been successfully mapped! Auto-Mapper will close in 5 seconds.. >> authNetDrive%SUID%.bat
echo     timeout 15 >> authNetDrive%SUID%.bat
echo     :end_AUTH >> authNetDrive%SUID%.bat
echo     del "%SYSDRIVE%\Users\%USERNAME%\Documents\authNetDrive%SUID%.bat" >> authNetDrive%SUID%.bat
echo     exit >> authNetDrive%SUID%.bat
echo ) >> authNetDrive%SUID%.bat
start authNetDrive%SUID%.bat
GOTO:END

REM ------------------------------------
REM FUNCTION RAISE_ERROR (ERROR_MESSAGE)
REM ------------------------------------
GOTO:END
:RAISE_ERROR

IF NOT exist "%SYSDRIVE%\Users\%USERNAME%\Documents" (
    MKDIR "%SYSDRIVE%\Users\%USERNAME%\Documents" || ECHO Critical failure - GENERAL. Please contact your IT administrator.
)

REM Navigate to Documents
CD "%SYSDRIVE%\Users\%USERNAME%\Documents"
REM Set unique identifier so the correct child script is deleted after execution.
SET /a SUID=(%Random%)
REM Write child script to Documents folder.
echo @ECHO OFF > raiseError%SUID%.bat
echo SETLOCAL >> raiseError%SUID%.bat
echo color 0F >> raiseError%SUID%.bat
REM Display error message.
echo ECHO\ >> raiseError%SUID%.bat
echo ECHO An error occurred while AutoMapper was maintaining your drives. Please read the message below:>> raiseError%SUID%.bat
echo ECHO %~1%% >> raiseError%SUID%.bat
echo ECHO\ >> raiseError%SUID%.bat
echo timeout 30 >> raiseError%SUID%.bat
echo del "%SYSDRIVE%\Users\%USERNAME%\Documents\raiseError%SUID%.bat" >> raiseError%SUID%.bat
echo exit >> raiseError%SUID%.bat
start raiseError%SUID%.bat
GOTO:END

REM ------------------------------------
REM FUNCTION LOG_DRIVES ()
REM ------------------------------------
GOTO:END
:LOG_DRIVES

REM Check if log path exists.
ECHO\
ECHO Looking for Logs folder..
IF NOT exist "%LOG_PATH%" (
    ECHO Error - Failed to locate Logs folder. Will NOT generate drives log for %USERNAME%. Continuing..
    GOTO:END
) ELSE (
    ECHO Found Logs folder^^!
)

REM Navigate to Logs
CD "%LOG_PATH%"
REM Write user folder if not exist
IF NOT exist "%LOG_PATH%\%USERNAME%" (
    MKDIR "%LOG_PATH%\%USERNAME%" || ECHO Failed to create Logs folder for %USERNAME%.
)
REM Generate filename with timestamp
FOR /f "tokens=2-4 delims=/ " %%a IN ('date /t') DO (set mydate=%%c-%%a-%%b)
FOR /f "tokens=1-2 delims=/:" %%a IN ("%TIME%") DO (set mytime=%%a%%b)
REM Write currently networked drives to log file.
net use >> "%LOG_PATH%\%USERNAME%\%USERNAME%_%mydate%_%mytime%.txt" || ECHO Failed to create log file.

REM =================================== FUNCTION DEFINITIONS =================================== 

:END
