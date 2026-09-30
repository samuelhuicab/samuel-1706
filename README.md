# Snail Casa de apuestas

Aplicación web de ejemplo con temática de carreras de caracoles. Permite registrarse, iniciar sesión, consultar un dashboard con estadísticas simuladas y recargar saldo mediante **SnailPay**, una pasarela de pagos simulada construida en Express.

> Todos los datos de tarjetas de este proyecto son ficticios. SnailPay no se conecta con ningún servicio real ni procesa información financiera real.

## Contenido

- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Ejecutar el proyecto](#ejecutar-el-proyecto)
- [Ejecutar las pruebas](#ejecutar-las-pruebas)
- [SnailPay: cómo reproducir cada respuesta](#snailpay-cómo-reproducir-cada-respuesta)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Datos guardados en localStorage](#datos-guardados-en-localstorage)

## Tecnologías

| Parte | Tecnologías |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Apache ECharts, bcryptjs |
| Backend | Node.js, Express, TypeScript, Zod, tsx |
| Pruebas | Vitest, Supertest |

## Requisitos

- **Node.js 20 o superior** (se recomienda la versión LTS más reciente) y npm.
- Git.

Comprueba tu versión con:

```bash
node -v
```

## Instalación

Clona el repositorio e instala las dependencias de cada proyecto. `client` y `server` son proyectos independientes, cada uno con su propio `package.json`.

```bash
git clone https://github.com/samuelhuicab/samuel-1706.git
cd samuel-1706

cd server
npm install

cd ../client
npm install
```

## Ejecutar el proyecto

Se necesitan **dos terminales**, una para cada parte.

**Terminal 1 — backend (SnailPay):**

```bash
cd server
npm run dev
```

El servidor queda en `http://localhost:3001`. Para comprobar que está activo, abre `http://localhost:3001/api/health`; debe responder `{"status":"estoy vivo :)"}`.

**Terminal 2 — frontend:**

```bash
cd client
npm run dev
```

Abre la dirección que muestra la terminal (normalmente `http://localhost:5173`).

En desarrollo, Vite reenvía todas las peticiones que empiezan con `/api` al backend en el puerto 3001, así que no hace falta configurar CORS.

### Variables de entorno del backend (opcionales)

| Variable | Valor por defecto | Para qué sirve |
|---|---|---|
| `PORT` | `3001` | Puerto del servidor |
| `SNAILPAY_MODE` | (vacío) | Con `down`, SnailPay rechaza **todas** las solicitudes con error del sistema |
| `SNAILPAY_TIMEOUT_MS` | `5000` | Milisegundos que tarda la tarjeta de timeout en responder |

Cómo arrancar el servidor con una variable, por ejemplo `SNAILPAY_MODE=down`:

| Sistema | Comando (dentro de `server`) |
|---|---|
| macOS / Linux | `SNAILPAY_MODE=down npm run dev` |
| Windows (PowerShell) | `$env:SNAILPAY_MODE="down"; npm run dev` |
| Windows (CMD) | `set SNAILPAY_MODE=down && npm run dev` |

En PowerShell la variable se queda en esa terminal; para quitarla usa `Remove-Item Env:SNAILPAY_MODE` o abre una terminal nueva.

## Ejecutar las pruebas

**Backend:**

```bash
cd server
npm test
```

Ejecuta las pruebas de SnailPay con Vitest y Supertest. Las pruebas hacen peticiones a la aplicación de Express sin levantar el servidor, y cubren el cobro exitoso, los rechazos, los datos inválidos, el error del sistema y el timeout.

Para revisar los tipos de TypeScript del backend:

```bash
cd server
npm run typecheck
```

<!-- PENDIENTE: agregar aquí las instrucciones de las pruebas del frontend cuando estén listas -->

## SnailPay: cómo reproducir cada respuesta

**Endpoint:** `POST /api/snailpay/charges`

### Cuerpo de la petición

```json
{
  "card_number": "1234123412341234",
  "expiration_date": "12/26",
  "cvv": "543",
  "cardholder_name": "Nombre Apellido",
  "amount": 100,
  "payer_id": "id-del-usuario",
  "payer_email": "usuario@correo.com"
}
```

Desde la aplicación, `payer_id` y `payer_email` se toman automáticamente del usuario con sesión activa; el formulario solo pide los datos de la tarjeta y el monto.

### Tarjetas de prueba

En los números especiales, los últimos dígitos ayudan a recordarlos: `0051` es el código bancario de fondos insuficientes, `0500` el error HTTP interno y `0408` el de tiempo agotado.

| Escenario | Cómo se provoca | HTTP | `status` | `status_detail` |
|---|---|---|---|---|
| **Cobro exitoso** | Tarjeta `1234 1234 1234 1234`, vencimiento `12/26`, CVV `543`, cualquier nombre no vacío y monto mayor que 0 | 201 | `approved` | `accredited` |
| **Datos inválidos** | Cualquier campo vacío o con mal formato: tarjeta que no tenga 16 dígitos, mes inexistente (ej. `13/26`), CVV que no tenga 3 dígitos, monto menor o igual a 0, monto mayor a 10,000, correo inválido | 400 | `rejected` | `invalid_request` |
| **Datos de seguridad incorrectos** | Tarjeta `1234 1234 1234 1234` con otra fecha (ej. `11/26`) u otro CVV (ej. `111`) | 402 | `rejected` | `cc_rejected_bad_security_data` |
| **Fondos insuficientes** | Tarjeta `4000 0000 0000 0051` | 402 | `rejected` | `cc_rejected_insufficient_funds` |
| **Tarjeta rechazada** | Tarjeta `4000 0000 0000 0002` | 402 | `rejected` | `cc_rejected_card_declined` |
| **Tarjeta no reconocida** | Cualquier otra tarjeta de 16 dígitos (ej. `4111 1111 1111 1111`) | 402 | `rejected` | `cc_rejected_card_not_supported` |
| **Error del sistema** | Tarjeta `4000 0000 0000 0500` | 503 | `error` | `service_unavailable` |
| **Servicio caído** | Arrancar el backend con `SNAILPAY_MODE=down` (ver arriba). Todas las peticiones fallan, incluso con la tarjeta válida | 503 | `error` | `service_unavailable` |
| **Timeout** | Tarjeta `4000 0000 0000 0408`. El servidor tarda 5 segundos; el frontend deja de esperar a los 4 y muestra un mensaje de tiempo agotado | 504 | `error` | `gateway_timeout` |

Para las tarjetas especiales se puede usar cualquier fecha con formato `MM/AA` y cualquier CVV de 3 dígitos.

**En ningún escenario distinto al cobro exitoso se modifica el saldo** ni se genera código de autorización.

### Orden en que SnailPay revisa una solicitud

1. Si el servicio está caído (`SNAILPAY_MODE=down`) → error del sistema.
2. Si los datos no tienen el formato correcto → datos inválidos.
3. Tarjetas especiales: error del sistema, timeout, fondos insuficientes y rechazada.
4. Tarjeta de cobro exitoso: se aprueba solo si la fecha **y** el CVV coinciden; si no, datos de seguridad incorrectos.
5. Cualquier otra tarjeta → no reconocida.

La aprobación es la última opción: para llegar a ella, la solicitud tuvo que pasar todas las revisiones anteriores.

### Formato de la respuesta

Todas las respuestas, aprobadas o no, incluyen los mismos campos. Los que no aplican se devuelven como `null`.

| Campo | Descripción |
|---|---|
| `id` | Identificador único de la operación (UUID) |
| `status` | Estado general: `approved`, `rejected` o `error` |
| `status_detail` | Detalle del resultado (ver tabla de tarjetas) |
| `message` | Mensaje en español para mostrar al usuario |
| `transaction_amount` | Monto solicitado |
| `date_created` | Fecha de creación de la operación (ISO 8601) |
| `authorization_code` | Código de 6 dígitos, solo en cobros aprobados; `null` en los demás |
| `reference` | Referencia corta de la operación, ej. `SP-3F2A9C1B` |
| `payer_id` | Identificador del usuario |
| `payer_email` | Correo del usuario |
| `card_number` | Número de tarjeta ficticio enviado |
| `cvv` | CVV ficticio enviado |

En las respuestas de **datos inválidos** y **servicio caído**, los datos del pagador, la tarjeta y el monto son `null`, porque la solicitud no llegó a validarse.

`rejected` significa que SnailPay funcionó y decidió no cobrar (problema de la tarjeta o de los datos). `error` significa que SnailPay no pudo procesar la solicitud (problema del servicio).

### Ejemplo de respuesta aprobada

```json
{
  "id": "3f2a9c1b-7d4e-4a2b-9c1d-5e6f7a8b9c0d",
  "status": "approved",
  "status_detail": "accredited",
  "message": "Recarga aprobada. Tu saldo se actualizó.",
  "transaction_amount": 100,
  "date_created": "2026-09-30T18:00:00.000Z",
  "authorization_code": "004521",
  "reference": "SP-3F2A9C1B",
  "payer_id": "id-del-usuario",
  "payer_email": "usuario@correo.com",
  "card_number": "1234123412341234",
  "cvv": "543"
}
```

## Estructura del proyecto

```
├── client/                     Frontend (React + Vite)
│   └── src/
│       ├── components/
│       │   ├── charts/         Gráficas (componente puente con ECharts, donut y barras)
│       │   ├── recharge/       Formulario de recarga con SnailPay
│       │   └── ui/             Componentes reutilizables (TextField, Card)
│       ├── context/            AuthContext: usuario, sesión, saldo y acciones
│       ├── pages/              Login, registro y dashboard
│       ├── routes/             Rutas protegidas y rutas solo públicas
│       ├── services/           localStorage, autenticación, dashboard, SnailPay, saldo
│       ├── types/              Tipos de TypeScript
│       └── utils/              Validaciones, simulación de carreras, formato y montos
│
└── server/                     Backend (Express)
    ├── src/
    │   ├── controllers/        Recibe la petición y envía la respuesta
    │   ├── routes/             Rutas de SnailPay
    │   ├── services/           Lógica de SnailPay: decide cada escenario
    │   ├── types/              Tipos de la petición y la respuesta
    │   ├── validation/         Esquema de validación con Zod
    │   ├── app.ts              Crea y configura la aplicación (se usa en las pruebas)
    │   └── index.ts            Enciende el servidor
    └── tests/                  Pruebas automatizadas de SnailPay
```

## Datos guardados en localStorage

La aplicación no usa base de datos: toda la información se guarda en el navegador.

| Llave | Contenido |
|---|---|
| `caracol.users` | Lista de usuarios registrados. La contraseña se guarda solo como hash de bcrypt |
| `caracol.session` | Sesión activa: solo el identificador del usuario |
| `caracol.race` | Día de carreras simulado: el ganador de cada una de las 6 carreras |
| `caracol.bets` | Apuestas simuladas de cada usuario (ganadas y perdidas) |
| `caracol.transactions` | Historial de respuestas de SnailPay, incluyendo número de tarjeta y CVV ficticios |

Para empezar de cero, borra estas llaves desde las herramientas del navegador (F12 → Application → Local Storage).

### Consideraciones de seguridad

Este proyecto es una simulación y tiene limitaciones que no serían aceptables en producción:

- El hash de la contraseña se calcula en el navegador y queda visible en localStorage. En un sistema real se haría en el servidor.
- El backend no puede verificar la identidad del usuario, porque la sesión no la emite el servidor; solo valida el formato de `payer_id` y `payer_email`.
- Se guardan el número de tarjeta y el CVV porque así lo requiere el ejercicio. Una aplicación real nunca almacenaría el CVV.