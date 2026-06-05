# 📚 DOCUMENTACIÓN DE ENDPOINTS API

**Fecha:** 04 de Junio 2026  
**Versión API:** v1  
**Base URL:** `http://localhost/api/v1`

---

## 🔐 AUTENTICACIÓN

| Método | Endpoint | Descripción | Autenticado |
|--------|----------|-------------|-------------|
| POST | `/login` | Iniciar sesión | ❌ |
| GET | `/user` | Obtener usuario actual | ✅ |
| POST | `/logout` | Cerrar sesión | ✅ |

---

## 📊 REPORTES

### Reporte de Ventas
```http
GET /reports/sales
```

**Parámetros:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| start_date | string (date) | No | Fecha inicio (default: primer día del mes) |
| end_date | string (date) | No | Fecha fin (default: último día del mes) |
| period | string | No | Agrupación: day, week, month, year (default: day) |

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_sales": 15000.00,
      "sales_count": 150,
      "average_ticket": 100.00
    },
    "sales_by_period": [...],
    "top_products": [...],
    "sales_by_category": [...]
  }
}
```

### Reporte de Inventario
```http
GET /reports/inventory
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_products": 500,
      "total_stock": 10000,
      "total_value": 50000.00,
      "low_stock_count": 25,
      "out_of_stock_count": 5
    },
    "low_stock_products": [...],
    "out_of_stock_products": [...],
    "stock_by_category": [...],
    "expiring_batches": [...],
    "top_moving_products": [...]
  }
}
```

### Reporte Financiero
```http
GET /reports/financial
```

**Parámetros:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| start_date | string (date) | No | Fecha inicio |
| end_date | string (date) | No | Fecha fin |

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_revenue": 15000.00,
      "cost_of_goods_sold": 8000.00,
      "gross_profit": 7000.00,
      "profit_margin": 46.67,
      "total_purchases": 5000.00,
      "net_profit": 2000.00
    },
    "revenue_by_category": [...],
    "daily_revenue": [...],
    "top_profitable_products": [...]
  }
}
```

---

## 🔔 ALERTAS

### Todas las Alertas
```http
GET /alerts
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "alerts": [...],
    "count": 30,
    "summary": {
      "stock_alerts": 25,
      "expiry_alerts": 5,
      "critical": 10,
      "high": 15,
      "medium": 5
    }
  }
}
```

### Alertas de Stock Bajo
```http
GET /stock-alerts
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": 1,
        "type": "low_stock",
        "product_id": 10,
        "product_name": "Paracetamol 500mg",
        "product_code": "PAR-500",
        "message": "Stock bajo: Paracetamol 500mg tiene 5 unidades (mínimo: 20)",
        "current_stock": 5,
        "min_stock": 20,
        "stock_percentage": 25.0,
        "severity": "high"
      }
    ],
    "count": 25,
    "critical": 5,
    "high": 15,
    "medium": 5
  }
}
```

### Alertas de Vencimiento
```http
GET /expiry-alerts
```

**Parámetros:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| days | integer | No | Días para buscar vencimientos (default: 90) |

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": 1,
        "type": "expiry",
        "batch_id": 15,
        "batch_number": "LOT-2026-001",
        "product_id": 10,
        "product_name": "Amoxicilina 250mg",
        "message": "Lote LOT-2026-001 de Amoxicilina 250mg vence en 15 días",
        "stock": 50,
        "expiration_date": "2026-06-19",
        "days_until_expiry": 15,
        "total_value": 250.00,
        "severity": "high"
      }
    ],
    "count": 5,
    "critical": 2,
    "high": 3,
    "total_value_at_risk": 1250.00
  }
}
```

---

## 👥 GESTIÓN DE USUARIOS

### Listar Usuarios
```http
GET /user-management
```

**Parámetros:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| search | string | No | Búsqueda por nombre o email |
| role_id | integer | No | Filtrar por rol |
| active | boolean | No | Filtrar por estado |
| per_page | integer | No | Resultados por página (default: 25) |

### Crear Usuario
```http
POST /user-management
```

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@farmacia.com",
  "password": "secret123",
  "role_id": 1
}
```

### Actualizar Usuario
```http
PUT /user-management/{id}
```

**Body:**
```json
{
  "name": "Juan Pérez García",
  "email": "juan.garcia@farmacia.com",
  "role_id": 2,
  "active": true
}
```

### Eliminar Usuario
```http
DELETE /user-management/{id}
```

### Cambiar Contraseña
```http
POST /change-password
```

**Body:**
```json
{
  "current_password": "old_password",
  "password": "new_password",
  "password_confirmation": "new_password"
}
```

### Combo de Usuarios
```http
GET /users-combo
```

---

## 🎭 GESTIÓN DE ROLES

### Listar Roles
```http
GET /role
```

### Crear Rol
```http
POST /role
```

**Body:**
```json
{
  "name": "Farmacéutico",
  "description": "Acceso a módulo de ventas e inventario"
}
```

### Actualizar Rol
```http
PUT /role/{id}
```

### Eliminar Rol
```http
DELETE /role/{id}
```

### Combo de Roles
```http
GET /roles-combo
```

### Permisos Disponibles
```http
GET /permissions
```

---

## 📦 GESTIÓN DE LOTES

### Listar Lotes
```http
GET /batch
```

**Parámetros:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| product_id | integer | No | Filtrar por producto |
| search | string | No | Búsqueda por número de lote o nombre de producto |
| status | string | No | active, expiring, expired |
| per_page | integer | No | Resultados por página |

### Ver Lote
```http
GET /batch/{id}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "batch": {...},
    "movements": [...],
    "purchases": [...],
    "summary": {
      "initial_stock": 100,
      "current_stock": 45,
      "total_sold": 55,
      "days_until_expiry": 60,
      "status": "active"
    }
  }
}
```

### Ajustar Stock de Lote
```http
POST /batch/{id}/adjust
```

**Body:**
```json
{
  "adjustment": 10,
  "reason": "Inventario físico -差异 found",
  "type": "increase"
}
```

### Combo de Lotes
```http
GET /batches-combo?product_id=1
```

### Resumen de Lotes
```http
GET /batches-summary
```

---

## 🤖 PREDICCIONES AI

### Obtener Predicciones
```http
GET /predictions
```

### Regenerar Predicciones
```http
POST /predictions/regenerate
```

**Body (opcional):**
```json
{
  "product_ids": [1, 2, 3]
}
```

---

## 📋 AUDITORÍA

### Listar Logs de Auditoría
```http
GET /audit/logs
```

**Parámetros:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| auditable_type | string | No | Tipo de modelo (App\Models\Product) |
| auditable_id | integer | No | ID del modelo |
| event | string | No | created, updated, deleted |
| user_id | integer | No | ID del usuario |
| start_date | string (date) | No | Fecha inicio |
| end_date | string (date) | No | Fecha fin |
| per_page | integer | No | Resultados por página |

### Ver Detalle de Auditoría
```http
GET /audit/logs/{id}
```

### Estadísticas de Auditoría
```http
GET /audit/stats
```

---

## 📁 ARCHIVOS CREADOS

### Backend (pharmacy-api-laravel)

#### Controladores
- `app/Http/Controllers/Api/ReportController.php`
- `app/Http/Controllers/Api/AlertController.php`
- `app/Http/Controllers/Api/UserController.php`
- `app/Http/Controllers/Api/RoleController.php`
- `app/Http/Controllers/Api/BatchController.php`
- `app/Http/Controllers/Api/PredictionController.php`
- `app/Http/Controllers/Api/AuditController.php`

#### Form Requests
- `app/Http/Requests/User/StoreUserRequest.php`
- `app/Http/Requests/User/UpdateUserRequest.php`
- `app/Http/Requests/User/ChangePasswordRequest.php`
- `app/Http/Requests/Role/StoreRoleRequest.php`
- `app/Http/Requests/Role/UpdateRoleRequest.php`
- `app/Http/Requests/Batch/AdjustBatchRequest.php`

#### Modelos
- `app/Models/AuditLog.php`

#### Traits
- `app/Traits/Auditable.php`

#### Migraciones
- `database/migrations/2026_06_04_000000_create_audit_logs_table.php`

#### Rutas
- `routes/api.php` (actualizado)

### Frontend (pharma-web-vue)
- `docs/ANALISIS_COMPARATIVO_FRONTEND_BACKEND.md`
- `docs/API_DOCUMENTATION.md` (este archivo)

---

## 🔄 PRÓXIMOS PASOS

### Fase 3 Pendiente
1. **Facturación PDF** - Crear endpoint para generar PDFs
2. **Exportar reportes Excel** - Crear endpoint para exportar datos
3. **Notificaciones WebSocket** - Implementar tiempo real
4. **Conectar Frontend** - Reemplazar datos mock con llamadas API

---

## ✅ VERIFICACIÓN

Para verificar que los endpoints funcionan, ejecuta:

```bash
# Listar todas las rutas
php artisan route:list --path=api

# Ejecutar migraciones
php artisan migrate

# Verificar controladores
php artisan tinker
```
