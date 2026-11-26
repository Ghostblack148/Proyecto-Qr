# Control de Asistencia por QR — T01

Aplicación móvil en **React Native con Expo** para que el docente genere un código QR en pantalla y los alumnos marquen asistencia escaneándolo con su teléfono, dentro de una ventana de tiempo acotada. Incluye un servidor local en Node.js sin dependencias externas.

Trabajo de la Unidad 3 · Desarrollo de Aplicaciones Móviles y Web · UTEM.

---

## Qué hace

| Rol | Funcionalidad |
| :--- | :--- |
| Docente | Crea una sesión con ventana de 1, 3, 5 o 10 minutos, muestra el QR, ve la lista de asistentes en vivo y exporta el registro en CSV |
| Alumno | Ingresa nombre y RUT, escanea el QR o escribe el código a mano, y recibe la confirmación |

### Medidas de seguridad
* **QR rotativo:** el código cambia cada 20 segundos. Una foto del QR enviada a alguien que no está en la sala deja de servir.
* **Token imposible de adivinar:** se calcula en el servidor con HMAC-SHA256 y un secreto por sesión que nunca sale del servidor.
* **Lista protegida:** solo el docente (con una clave que recibe al crear la sesión) puede ver el QR vigente y la lista.
* **RUT validado** con dígito verificador en la app y en el servidor, sin repetidos en la misma sesión.
* **Minimización (Ley 21.719):** se guarda solo nombre, RUT y hora, en memoria; todo se borra al apagar el servidor. La cámara solo lee el QR, no guarda fotos ni video.

### Flujo del permiso de cámara
1. **Explicación propia** antes del diálogo del sistema (para qué se usa y qué no se guarda).
2. **Concedido:** abre la cámara.
3. **Denegado** (Android, primer rechazo): explica que se puede marcar escribiendo el código y permite reintentar.
4. **Rechazo definitivo** (iPhone desde el primer rechazo): botón **Abrir ajustes**; al volver, la app detecta el cambio sola.
5. En todos los casos la app sigue siendo útil: el código de 8 caracteres bajo el QR se puede escribir a mano.

---

## Arquitectura

```text
├── App.js                          # Navegación (native-stack) y proveedor de estado
├── server/
│   └── index.js                    # Servidor local: sesiones, QR rotativo, registro
└── src/
    ├── context/AppContext.js       # Estado compartido: URL del servidor y mediciones
    ├── hooks/usePermisoCamara.js   # Estados del permiso + abrir Ajustes + AppState
    ├── services/asistenciaService.js  # Único archivo con fetch: r.ok, timeout, errores
    ├── utils/rut.js                # Validación de RUT (compartida con el servidor)
    ├── theme.js                    # Colores y estilos comunes
    └── screens/
        ├── InicioScreen.js         # Elegir rol y dirección del servidor
        ├── DocenteScreen.js        # QR, lista en vivo, exportación
        ├── AlumnoScreen.js         # Datos del alumno, código manual, resultado
        ├── PermisoScreen.js        # Explicación y caminos del permiso
        ├── EscanerScreen.js        # Cámara con anti-rebote y medición
        └── MedicionesScreen.js     # Promedio, mínimo y máximo de las mediciones
```

---

## Requisitos

* **Node.js** LTS y **Git** en el computador
* Teléfono **Android o iPhone** con **Expo Go** (versión compatible con Expo SDK 58)
* Computador y teléfonos en la **misma red Wi-Fi**

## Cómo levantarlo

```bash
git clone https://github.com/Ghostblack148/Proyecto-Qr.git
cd Proyecto-Qr
npm install
```

**Terminal 1 — servidor:**
```bash
node server/index.js
```
Anota la URL que aparece (por ejemplo `http://192.168.1.15:3000`). En Windows, si aparece el aviso del firewall, permite el acceso en **redes privadas**.

**Terminal 2 — app:**
```bash
npx expo start
```
Escanea el QR de la terminal con Expo Go (Android) o con la cámara (iPhone). En la app, escribe la URL del servidor en la pantalla de inicio.

> En iPhone, acepta el permiso de **Red local** que pide Expo Go; sin él la app no llega al servidor.

## Cómo probarlo
1. En un teléfono (o en el mismo), entra como **Docente** y genera el QR.
2. En otro teléfono, entra como **Alumno**, escribe nombre y un RUT válido (por ejemplo `11.111.111-1`) y escanea.
3. El alumno aparece en la lista del docente en menos de 2 segundos.
4. Prueba los errores: escanear dos veces (DUPLICADO), usar un código viejo después de 40 s (VENCIDO), esperar que cierre la ventana (EXPIRADO), apagar el servidor (SIN_CONEXION).

## Medición
La pantalla **Ver mediciones** registra automáticamente:
* **Carga de la cámara:** desde que se toca Continuar o Escanear hasta `onCameraReady`.
* **Registro:** desde que se lee el QR hasta que el servidor confirma.

Hacer 10 repeticiones en el teléfono físico y copiar promedio, mínimo y máximo a la planilla. Las mediciones se borran al cerrar la app.

## Repetir las pruebas del permiso
* **Android:** Ajustes → Aplicaciones → Expo Go → Permisos → Cámara
* **iPhone:** Ajustes → Expo Go → Cámara

## Limitaciones conocidas
* Los datos viven en la memoria del servidor: si se apaga, se pierden las sesiones.
* Depende de que todos estén en la misma red Wi-Fi que el computador del docente.
* Un alumno presente podría marcar por otro escribiendo un RUT ajeno; validar identidad requeriría inicio de sesión institucional.
