!macro customInstall
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Orbit" "" "Orbit"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Orbit\Capabilities" "ApplicationName" "Orbit"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Orbit\Capabilities" "ApplicationDescription" "Orbit web browser"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Orbit\Capabilities\URLAssociations" "http" "OrbitURL"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Orbit\Capabilities\URLAssociations" "https" "OrbitURL"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\Orbit\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}"'
  WriteRegStr HKCU "Software\RegisteredApplications" "Orbit" "Software\Clients\StartMenuInternet\Orbit\Capabilities"
  WriteRegStr HKCU "Software\Classes\OrbitURL" "" "Orbit URL"
  WriteRegStr HKCU "Software\Classes\OrbitURL" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\OrbitURL\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
!macroend
!macro customUnInstall
  DeleteRegKey HKCU "Software\Clients\StartMenuInternet\Orbit"
  DeleteRegValue HKCU "Software\RegisteredApplications" "Orbit"
  DeleteRegKey HKCU "Software\Classes\OrbitURL"
!macroend
