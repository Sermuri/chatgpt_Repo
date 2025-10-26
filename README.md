# Live Transcriber

Live Transcriber es una aplicación de escritorio para Windows que captura audio del micrófono, lo transcribe en tiempo real con [faster-whisper](https://github.com/guillaumekln/faster-whisper) y envía el texto a la ventana que tenga el foco.

## Requisitos

- Python 3.10 o superior
- Windows 10/11 con permisos de micrófono y teclado habilitados
- Controladores WASAPI actualizados (normalmente incluidos en Windows)

## Instalación del entorno de desarrollo

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install --upgrade pip
pip install -e .[dev]
```

Las dependencias principales incluyen:

- `faster-whisper` para la transcripción
- `sounddevice` o `pyaudio` para la captura de audio
- `pywin32`, `keyboard` y `pyautogui` para inyectar texto o simular pegado
- `PySide6` para el icono de bandeja del sistema (se desactiva automáticamente si no está instalado)

## Configuración

La aplicación crea un archivo `config.json` en `%USERPROFILE%\\.live_transcriber\\`. Puedes editarlo para ajustar:

- `audio_device`: nombre del dispositivo de entrada
- `sample_rate` y `block_size`
- `language` y `model_path`
- `push_to_talk_key`: atajo global para activar la transcripción
- `enable_telemetry`: habilita el envío opcional de métricas al endpoint configurado

## Uso

1. Activa el entorno virtual y ejecuta:
   ```bash
   python -m app.main
   ```
2. Mantén pulsado el atajo configurado (por defecto `Alt+Space`) para activar la transcripción.
3. Suelta la tecla para detener la captura. El texto se envía automáticamente a la aplicación con foco.

### Permisos

- **Micrófono**: asegúrate de que Windows permita a la aplicación acceder al micrófono.
- **Teclado**: el módulo `keyboard` necesita ejecutarse como administrador para registrar atajos globales.

## Ejecución de pruebas

```bash
pytest
```

## Empaquetado

En la carpeta `build/` se incluyen scripts para crear un ejecutable standalone mediante PyInstaller y un instalador de Inno Setup. Consulta los comentarios de cada script para personalizar rutas o certificados de firma.

## Actualizaciones

Para actualizar el modelo o la aplicación:

1. Actualiza el repositorio con `git pull`.
2. Reinstala dependencias con `pip install -e .` si hay cambios en el `pyproject.toml`.
3. Vuelve a generar el ejecutable con `build/build_exe.ps1`.

## Telemetría opcional y privacidad

Si habilitas la telemetría, solo se enviarán métricas anónimas de uso (duración de sesiones, errores de transcripción). Puedes revisar el endpoint configurado en `config.json`. Por defecto la telemetría está desactivada. Ten en cuenta que la transcripción se realiza localmente; no se envían datos de audio a servidores externos a menos que configures lo contrario.

## Soporte

- Para solucionar errores de audio, verifica que ningún otro programa esté utilizando el micrófono.
- Si el atajo global no funciona, ejecuta la aplicación como administrador y revisa que la tecla no esté en uso por otra aplicación.

