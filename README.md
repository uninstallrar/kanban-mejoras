# Sistema Kanban de Gestión de Demandas y Mejoras

CRM interno para centralizar y dar seguimiento de **larga duración** a las solicitudes de mejora que los empleados piden al equipo de Soporte/Desarrollo. Los tickets pueden permanecer activos semanas o meses, con historial transparente, debate y cambios de estado pausados.

**Stack:** React + TypeScript · Vite · Tailwind CSS · Supabase (Auth + PostgreSQL + Storage + Realtime) · Lucide Icons. Pensado para desplegar en **Vercel**.

---

## ✨ Funcionalidades

- **Tablero Kanban** con 6 columnas: Bandeja/Evaluación → Priorizado → En Desarrollo → En Pruebas → Implementado → Rechazado/No viable.
- **Tarjetas** con app afectada (badge de color), solicitante, fecha y contador *“tiempo en esta etapa”*.
- **Roles (RBAC):** `admin` (mueve tarjetas, dictamina viabilidad, comenta) y `employee` (crea, ve y comenta; **solo lectura** sobre estados).
- **Formulario de carga** con adjuntos a Supabase Storage (capturas, PDF, Excel).
- **Detalle del ticket** en drawer lateral: veredicto de viabilidad con motivo obligatorio, y línea de tiempo que fusiona comentarios + audit log.
- **Audit log automático** (tabla `historial_estados`, vía trigger): registra quién cambió qué y cuándo.
- **Repositorio histórico**: tabla con buscador y filtros por app, estado y rango de fechas.
- **Realtime**: el tablero se actualiza en vivo entre usuarios.
- **Tema claro/oscuro** corporativo.

---

## 📁 Estructura del proyecto

```
kanban-mejoras/
├─ supabase/
│  └─ schema.sql              # Tablas + triggers + RLS + Storage (ejecutar en Supabase)
├─ src/
│  ├─ types/index.ts          # Tipos TS del dominio
│  ├─ lib/                    # constants.ts (catálogos), dates.ts (helpers)
│  ├─ services/               # Capa de acceso a Supabase
│  │  ├─ supabaseClient.ts
│  │  ├─ authService.ts
│  │  ├─ solicitudesService.ts
│  │  ├─ comentariosService.ts
│  │  └─ storageService.ts
│  ├─ context/AuthContext.tsx # Sesión, perfil y rol global
│  ├─ hooks/useSolicitudes.ts # Carga + Realtime del tablero
│  ├─ components/
│  │  ├─ ui/                  # Button, Badge, Drawer, Field
│  │  ├─ layout/Header.tsx
│  │  ├─ auth/LoginScreen.tsx
│  │  ├─ kanban/              # KanbanBoard, KanbanColumn, TicketCard
│  │  └─ ticket/              # TicketForm, TicketDetail, ViabilityPanel, CommentTimeline
│  ├─ views/                  # DashboardView (Kanban), RepositoryView (histórico)
│  ├─ App.tsx
│  └─ main.tsx
├─ .env.example
├─ vercel.json
└─ package.json
```

---

## 🚀 Puesta en marcha local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
1. Creá un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor → New query**, pegá el contenido de `supabase/schema.sql` y ejecutá todo. Esto crea las tablas, los triggers de auditoría, las políticas **RLS** y el bucket `adjuntos`.
3. **Authentication → Providers:**
   - **Google:** activá el provider y cargá tu Client ID / Secret (consola de Google Cloud). En *Authorized redirect URIs* agregá `https://<tu-proyecto>.supabase.co/auth/v1/callback`.
   - **Phone:** activá *Phone* y configurá un proveedor SMS (Twilio, MessageBird, etc.).
4. **Authentication → URL Configuration:** agregá tu URL local (`http://localhost:5173`) y la de producción a *Redirect URLs*.

### 3. Variables de entorno
```bash
cp .env.example .env
```
Completá con los valores de **Settings → API**:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_BUCKET=adjuntos
```

### 4. Levantar el proyecto
```bash
npm run dev
```
Abrí `http://localhost:5173`.

> **¿Pantalla en blanco?** Casi siempre significa que falta el `.env` o que
> Vite no lo leyó. La app ahora detecta esto y muestra una pantalla de
> configuración con instrucciones (no más blanco). Si la ves:
> 1. Confirmá que existe `.env` (no solo `.env.example`) junto a `package.json`.
> 2. Que las variables empiecen con el prefijo **`VITE_`**.
> 3. **Reiniciá `npm run dev`**: Vite solo lee el `.env` al arrancar, un guardado
>    en caliente no alcanza.
>
> Cualquier otro error de render se muestra en pantalla con su mensaje (gracias
> al *ErrorBoundary*) y el detalle completo aparece en la consola del navegador
> (**F12 → Console**).

### 5. Asignar administradores
Tras el **primer login** de cada admin, ejecutá en el SQL Editor:
```sql
update public.profiles set rol = 'admin'
where email in ('vos@empresa.com', 'companero1@empresa.com', 'companero2@empresa.com');
```
El resto queda como `employee` automáticamente.

---

## ☁️ Despliegue en Vercel

1. Subí el repo a GitHub e importalo en [vercel.com](https://vercel.com).
2. Framework preset: **Vite** (se detecta solo). Build: `npm run build`, Output: `dist`.
3. **Settings → Environment Variables:** cargá las mismas tres variables del `.env`.
4. Deploy. El archivo `vercel.json` ya incluye el *rewrite* para que la SPA funcione en cualquier ruta.
5. Agregá la URL de Vercel a las *Redirect URLs* de Supabase (paso 2.4).

---

## 🔐 Seguridad: por qué confiar en los permisos

La UI **oculta** los controles de edición a los empleados, pero la protección real está en **Row Level Security (RLS)** del lado del servidor:

- Solo `admin` puede `UPDATE`/`DELETE` en `solicitudes` (función `is_admin()`).
- Cualquiera puede crear solicitudes y comentarios, pero **solo a su propio nombre**.
- El `historial_estados` se escribe mediante un trigger `SECURITY DEFINER`: nadie puede falsificar el audit log.

Aunque alguien manipule el frontend, Supabase rechaza las operaciones no autorizadas.

---

## 🧩 Cómo extenderlo

- **Nueva app destino:** agregá la clave en `APPS` y su estilo en `APP_BADGE` (`src/lib/constants.ts`).
- **Nueva columna de estado:** agregá el valor al `check` de `status` en el SQL y a `COLUMNS`/`STATUS_ORDER`.
- **Notificaciones por email:** podés enganchar una *Edge Function* de Supabase al trigger de cambios.
- **Drag & drop avanzado:** el tablero usa HTML5 nativo; si querés reordenamiento dentro de columna, integrá `@dnd-kit/core`.
