# 🛠️ Backend - Sistema de Gestión de Inventario

<div align="center">
  <img src="https://img.shields.io/github/last-commit/KalanOne/AppInventarioBack?color=4ade80&label=Last%20Commit&style=flat-square" alt="Last Commit" style="border-radius:5px" />
  <img src="https://img.shields.io/github/stars/KalanOne/AppInventarioBack?style=flat-square&color=facc15" alt="Stars" style="border-radius:5px" />
  <img src="https://img.shields.io/github/issues/KalanOne/AppInventarioBack?style=flat-square&color=ef4444" alt="Issues" style="border-radius:5px" />
  <img src="https://img.shields.io/github/license/KalanOne/AppInventarioBack?style=flat-square&color=6366f1" alt="License" style="border-radius:5px" />
</div>

---

## 📦 Descripción

API REST robusta y modular construida con **NestJS** para el manejo de un sistema de inventario con:
- Transacciones de entrada/salida
- Control de productos con y sin número de serie
- Validaciones complejas de existencia
- Generación de reportes Excel
- Soporte para operaciones con o sin afectación al inventario
- Control de almacenes y usuarios

---

## 🔧 Tecnologías

- **NestJS** v10
- **PostgreSQL** con **TypeORM**
- **ExcelJS** para generación de reportes
- **PM2** para orquestación en producción
- **Jest** para pruebas (opcional)
- **DTOs**, **pipes** y **guards** para arquitectura limpia

---

## ⚙️ Scripts

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run start:dev

# Producción (build + PM2)
npm run build
pm2 start pm2.config.js

# Migraciones (opcional)
npm run typeorm migration:run
```

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del backend:

```env
DB_PASSWORD=tu_contraseña
DB_NAME=tu_base_de_datos
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=tu_usuario
CONTAINER_NAME=tu_nombre_de_contenedor
LOG_DIR=./logs
NEST_PORT=3000
NEST_HOST=localhost

ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC=duration_in_seconds
JWT_SECRET=tu_secreto

# Drive Api Environment
# TODO: Change the following values
DRIVE_PARENT_FOLDER_ID=tu_id_de_carpeta_padre
DRIVE_OWNER_EMAIL=tu_correo_del_propietario
DRIVE_KEYS='{...}
'

```

---

## 🧠 Funcionalidades Clave

✅ Transacciones con control de afectación  
✅ Seriales únicos y trazabilidad  
✅ Agrupación por producto, almacén y unidad  
✅ Generación de reportes Excel con o sin seriales  
✅ Validaciones al ingresar o retirar inventario  
✅ Control de usuario autenticado en cada movimiento  

---

## 📤 Endpoint destacado - Reporte de inventario

```http
POST /reports/inventory/export
Content-Type: application/json

{
  "includeNonAfectation": true
}
```

🔁 Retorna un `Buffer` de archivo Excel generado dinámicamente según los datos del inventario actual.

---

## 📦 PM2 Producción

```bash
# Iniciar
pm2 start pm2.config.js

# Ver procesos
pm2 ls

# Reiniciar todos los servicios
pm2 restart all

# Ver logs
pm2 logs
```

---

## 📄 Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE).

---

## 🤝 Contribución

¿Tienes mejoras o ideas? ¡Pull requests y sugerencias son bienvenidas! 🙌

---

## 👨‍💻 Autor

Desarrollado por **Alan Garcia Diaz**  
📧 contacto: [alangarciadiazgardy@gmail.com](mailto:alangarciadiazgardy@gmail.com)  
🔗 [LinkedIn](https://www.linkedin.com/in/alan-garcia-diaz-811428264/) / [GitHub](https://github.com/KalanOne) / [Portfolio](https://www.alangardy.com/)

---