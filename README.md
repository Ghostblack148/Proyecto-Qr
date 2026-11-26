# Validador de Entradas QR — Feria Tecnológica UTEM (T13)

Aplicación móvil en **React Native con Expo** para validar entradas leyendo su código QR en el acceso de un evento universitario (Feria Tecnológica y Proyectos de Ingeniería — UTEM). Implementa el **flujo completo del permiso de cámara** con explicación previa y una **ruta alternativa sin cámara** (ingreso manual del código), de modo que la app sigue siendo útil aunque el permiso se rechace.

Tema **T13 · Flujo de permisos bien construido** · Unidad 3 · Desarrollo de Aplicaciones Móviles y Web · UTEM.

> **Datos de prueba:** todos los códigos son ficticios (`UTEM-2026-001` a `UTEM-2026-005`). No contienen datos personales y la app no guarda fotos ni video.

---

## Flujo del permiso de cámara

| Camino | Qué ve el usuario |
| :--- | :--- |
| **Explicación previa** | Pantalla propia que dice para qué se usa la cámara y qué no se guarda, antes del diálogo del sistema |
| **Concedido** | Se abre la cámara y valida entradas una tras otra |
| **Denegado** (Android, primer rechazo) | Explica que puede validar escribiendo el código y permite reintentar |
| **Rechazo definitivo** (iPhone desde el primer rechazo; Android tras dos) | Botón **Abrir ajustes** y botón para validar a mano; al volver de Ajustes la app detecta el cambio sola |
| **Revocado con la app abierta** | El escáner lo detecta y ofrece revisar el permiso o pasar al modo manual |

## Minimización de datos (Ley 21.719)

| Dato | ¿Se guarda? | Finalidad |
| :--- | :--- | :--- |
| Imagen de la cámara | No. Se procesa en el teléfono y se descarta | Leer el QR |
| Código de la entrada | Solo si ya se usó, en memoria | Impedir que una entrada se use dos veces |
| Nombre, RUT, correo | No se piden | No son necesarios para validar una entrada |

Todo se borra al cerrar la app.

---

## Arquitectura

```text
├── App.js                           # Navegación (native-stack) y proveedor de estado
└── src/
    ├── context/AppContext.js        # Estado compartido: mediciones
    ├── hooks/usePermisoCamara.js    # Estados del permiso + abrir Ajustes + AppState
    ├── services/validacionService.js # Servicio único de validación (VALIDO, YA_USADO, INVALIDO, ERROR)
    ├── components/Resultado.js      # Tarjeta de resultado reutilizada en escáner y manual
    ├── theme.js                     # Colores y estilos comunes
    └── screens/
        ├── InicioScreen.js          # Menú y contador de entradas usadas
        ├── PermisoScreen.js         # Explicación y caminos del permiso
        ├── EscanerScreen.js         # Cámara con anti-rebote, onCameraReady y medición
        ├── ManualScreen.js          # Ruta alternativa sin cámara
        └── MedicionesScreen.js      # Promedio, mínimo y máximo
```

No usa servidor: la validación corre en el teléfono, así que funciona sin conexión.

---

## Requisitos
* **Node.js** LTS y **Git** en el computador
* Teléfono **Android o iPhone** con **Expo Go** (compatible con Expo SDK 58)

## Cómo levantarlo

```bash
git clone https://github.com/Ghostblack148/Proyecto-Qr.git
cd Proyecto-Qr
npm install
npx expo start
```

Escanea el QR de la terminal con Expo Go (Android) o con la cámara (iPhone).

> **Si el teléfono no logra abrir el proyecto** (redes de empresa o universidad que bloquean conexiones entre dispositivos): inicia sesión con `npx expo login` (cuenta gratis de Expo, la misma en Expo Go) y usa `npx expo start --tunnel`.

## Códigos para probar

| Código | Estado inicial | Resultado esperado |
| :--- | :--- | :--- |
| `UTEM-2026-001` | Disponible | Primera vez **VÁLIDA**; segunda vez **YA USADA** |
| `UTEM-2026-002` | Disponible | Primera vez **VÁLIDA**; segunda vez **YA USADA** |
| `UTEM-2026-003` | Ya usado | **YA USADA** desde el primer intento |
| `UTEM-2026-004` | Disponible | Primera vez **VÁLIDA**; segunda vez **YA USADA** |
| `UTEM-2026-005` | Disponible | Primera vez **VÁLIDA**; segunda vez **YA USADA** |
| Cualquier otro con formato válido | No registrado | **NO EXISTE** |
| `ERROR-TEST` | Simulación | Falla controlada → **ERROR** |

Los QR de prueba están en `entradas-prueba.html`: ábrelo en el computador y escanéalos desde la pantalla. El botón **Reiniciar entradas de prueba** devuelve todo al estado inicial.

## Medición
La pantalla **Ver mediciones** registra automáticamente:
* **Validar escaneando:** desde que la cámara está lista hasta ver el resultado.
* **Validar digitando:** desde la primera tecla hasta ver el resultado.
* **Carga de la cámara:** desde que se toca Escanear o Continuar hasta `onCameraReady`.

Hacer 10 repeticiones de cada una en el teléfono físico y copiar promedio, mínimo y máximo a la planilla.

## Repetir las pruebas del permiso
* **Android:** Ajustes → Aplicaciones → Expo Go → Permisos → Cámara
* **iPhone:** Ajustes → Expo Go → Cámara

## Limitaciones conocidas
* Las entradas viven en la memoria de un solo teléfono: dos porteros con teléfonos distintos no comparten qué entradas ya se usaron. Resolverlo requiere un servidor compartido.
* El código de las entradas es secuencial (`001`, `002`…), así que se podría adivinar. En producción convendría un código aleatorio o firmado.
* En iPhone, el primer rechazo ya es definitivo, por lo que el camino "denegado, se puede reintentar" solo se puede mostrar en Android.
