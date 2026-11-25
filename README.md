# Validador de Entradas QR — Feria Tecnológica UTEM

Aplicación móvil desarrollada en **React Native** con **Expo** para validar entradas mediante lectura de códigos QR en el acceso de un evento universitario (Feria Tecnológica y Proyectos de Ingeniería — UTEM), con respaldo de ingreso manual y flujo explícito de permisos de cámara.

> **Nota de datos de prueba:** Todos los códigos incluidos son ficticios (`UTEM-2026-001` a `UTEM-2026-005`) y no contienen datos personales ni almacenan fotos o videos.

---

## Arquitectura del proyecto

El código está separado por capas para aislar pantallas, servicio de validación y hook de permisos:

```text
├── App.js                        # Orquestador de pantallas y medición inicial de latencia
└── src/
    ├── hooks/
    │   └── usePermisoCamara.js    # Solicitud de permisos (async/await + try/catch) y canAskAgain
    ├── screens/
    │   ├── EscanerScreen.js       # Lectura QR con CameraView, anti-rebote y onCameraReady
    │   └── ManualScreen.js        # Validación manual y acceso a Ajustes ante rechazo definitivo
    └── services/
        └── validacionService.js   # Servicio único de validación (VÁLIDO, YA_USADO, INVÁLIDO, ERROR)
```

---

## Requisitos previos

### En el computador
* **Node.js** (versión LTS compatible con la versión vigente de Expo SDK)
* **Git** y una cuenta de **GitHub**
* Editor de código (recomendado: **Visual Studio Code**)

### En el teléfono físico (obligatorio para cámara)
* Dispositivo **Android** o **iPhone** con **Expo Go** instalado desde la tienda oficial
* Computador y teléfono conectados a la **misma red Wi-Fi** (o usar modo túnel si la red bloquea la conexión local)

---

## Instalación y ejecución

### 1. En el teléfono físico
* Instala **Expo Go** desde Google Play Store (Android) o App Store (iPhone)
* Conecta el teléfono a la **misma red Wi-Fi** que el computador

### 2. En el computador (dentro de la carpeta del proyecto)
Abre una terminal en la carpeta raíz del proyecto (donde está `package.json`) y ejecuta:

1. **Clonar el repositorio (si aún no lo tienes local):**
   ```bash
   git clone https://github.com/<TU_USUARIO>/Proyecto-Qr.git
   cd Proyecto-Qr
   ```

2. **Instalar las dependencias del proyecto:**
   ```bash
   npm install
   ```

3. **Instalar/verificar módulos de Expo necesarios:**
   ```bash
   npx expo install expo-camera expo-linking
   ```

4. **Levantar la aplicación con Expo:**
   ```bash
   npx expo start
   ```
   *(Si el Wi-Fi de la red bloquea la conexión con el teléfono, usa `npx expo start --tunnel`).*

5. **Abrir en el teléfono:**
   * Abre **Expo Go** en tu teléfono y escanea el código QR que aparece en la terminal del computador

---

## Códigos ficticios para pruebas

| Código | Estado inicial | Comportamiento esperado |
| :--- | :--- | :--- |
| `UTEM-2026-001` | Disponible | Primera lectura: **VALIDO**; segunda lectura: **YA_USADO** |
| `UTEM-2026-002` | Disponible | Primera lectura: **VALIDO**; segunda lectura: **YA_USADO** |
| `UTEM-2026-003` | Ya usado | Retorna **YA_USADO** desde el primer intento |
| `UTEM-2026-004` | Disponible | Primera lectura: **VALIDO**; segunda lectura: **YA_USADO** |
| `UTEM-2026-005` | Disponible | Primera lectura: **VALIDO**; segunda lectura: **YA_USADO** |
| Cualquier otro texto | No registrado | Retorna **INVALIDO** |
| `ERROR-TEST` | Simulación | Dispara excepción controlada hacia estado **ERROR** |

---

## Medición de rendimiento y reinicio de pruebas

* **Tiempo de carga de cámara (`onCameraReady`):** Se registra en milisegundos desde que se presiona **Continuar** en la pantalla de explicación hasta que se dispara `onCameraReady` en el teléfono físico durante **10 repeticiones**, calculando **promedio, mínimo y máximo** en la planilla de medición
* **Reinicio de códigos en memoria:** Desde la pantalla inicial puedes restablecer el estado de las entradas de prueba sin reiniciar la aplicación
* **Reinicio de permisos en el teléfono para repetir pruebas:**
  * **Android:** *Ajustes → Aplicaciones → Expo Go → Permisos → Cámara*
  * **iPhone:** *Ajustes → Expo Go → Cámara*
