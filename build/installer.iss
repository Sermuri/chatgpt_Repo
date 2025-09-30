#define MyAppName "Live Transcriber"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "Live Transcriber"
#define MyAppURL "https://example.com"
#define MyAppExeName "LiveTranscriber.exe"

[Setup]
AppId={{A9FD0D2B-8E57-4C76-9385-8FF74D19A7F9}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputDir=dist
OutputBaseFilename=LiveTranscriberSetup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
WizardStyle=modern

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages/Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "Crear icono en el escritorio"; GroupDescription: "Opciones adicionales:"; Flags: unchecked

[Files]
Source: "dist\\LiveTranscriber\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "vcredist_x64.exe"; DestDir: "{tmp}"; Flags: dontcopy

[Run]
Filename: "{tmp}\\vcredist_x64.exe"; Parameters: "/install /passive /norestart"; StatusMsg: "Instalando Microsoft Visual C++ Redistributable..."; Flags: runhidden
Filename: "{app}\\{#MyAppExeName}"; Description: "Iniciar {#MyAppName}"; Flags: nowait postinstall skipifsilent

[Icons]
Name: "{groupName}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"
Name: "{userdesktop}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"; Tasks: desktopicon

[InstallDelete]
Type: filesandordirs; Name: "{app}\\logs"
