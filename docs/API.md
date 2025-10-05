# Documentação da API

Este documento detalha todos os endpoints da API utilizados pelo frontend, incluindo schemas de request/response e exemplos de uso.

**Base URL**: `http://localhost:8000` (desenvolvimento)

---

## 📑 Índice

- [Autenticação](#autenticação)
- [Dashboard](#dashboard)
- [Produtos](#produtos)
- [Pedidos](#pedidos)
- [Integrações](#integrações)
- [Logs de Sincronização](#logs-de-sincronização)
- [Marketplace Links](#marketplace-links)
- [Jobs](#jobs)
- [Privacidade/LGPD](#privacidadelgpd)
- [Health Check](#health-check)

---

## Autenticação

### Login
```http
POST /auth/login
```

**Request Body**:
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Códigos de erro**:
- `400`: Credenciais inválidas
- `401`: Usuário não autorizado

---

### Registro
```http
POST /auth/register
```

**Request Body**:
```json
{
  "email": "novo@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

**Response**: `201 Created`
```json
{
  "id": 1,
  "email": "novo@exemplo.com",
  "name": "Nome do Usuário",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Obter Usuário Atual
```http
GET /users/me
```

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Dashboard

### Obter Estatísticas do Dashboard
```http
GET /dashboard/overview
```

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
{
  "user_info": {
    "id": 1,
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com"
  },
  "total_products": 150,
  "total_orders": 45,
  "total_integrations": 3,
  "marketplaces": [
    {
      "name": "Mercado Livre",
      "products": 50,
      "orders": 20,
      "revenue": 15000.50
    }
  ],
  "recent_activity": [
    {
      "id": 1,
      "type": "order",
      "description": "Novo pedido #123",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Estatísticas de Produtos
```http
GET /dashboard/products/stats
```

**Response**: `200 OK`
```json
{
  "total": 150,
  "active": 145,
  "inactive": 5,
  "by_category": {
    "Eletrônicos": 50,
    "Moda": 30,
    "Livros": 70
  }
}
```

---

### Estatísticas de Pedidos
```http
GET /dashboard/orders/stats?days=30
```

**Query Parameters**:
- `days` (opcional): Número de dias (padrão: 30)

**Response**: `200 OK`
```json
{
  "total": 45,
  "pending": 5,
  "confirmed": 10,
  "shipped": 20,
  "delivered": 8,
  "cancelled": 2,
  "total_revenue": 50000.00,
  "average_order_value": 1111.11
}
```

---

### Timeline de Receita
```http
GET /dashboard/revenue/timeline?days=30
```

**Response**: `200 OK`
```json
{
  "timeline": [
    {
      "date": "2024-01-15",
      "revenue": 1500.00,
      "orders": 5
    },
    {
      "date": "2024-01-16",
      "revenue": 2300.00,
      "orders": 8
    }
  ]
}
```

---

### Alertas do Dashboard
```http
GET /dashboard/alerts
```

**Response**: `200 OK`
```json
{
  "alerts": [
    {
      "type": "warning",
      "message": "5 produtos com estoque baixo",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "type": "error",
      "message": "Falha na sincronização com Mercado Livre",
      "timestamp": "2024-01-15T09:15:00Z"
    }
  ]
}
```

---

## Produtos

### Listar Produtos
```http
GET /products?skip=0&limit=10&category=Eletrônicos&is_active=true
```

**Query Parameters**:
- `skip` (opcional): Offset para paginação (padrão: 0)
- `limit` (opcional): Limite de resultados (padrão: 10)
- `category` (opcional): Filtrar por categoria
- `is_active` (opcional): Filtrar por status ativo

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Notebook Dell",
    "description": "Notebook para trabalho e estudos",
    "price": 3500.00,
    "stock_quantity": 10,
    "sku": "NB-DELL-001",
    "category": "Eletrônicos",
    "image_url": "https://exemplo.com/imagem.jpg",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Obter Produto por ID
```http
GET /products/{id}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "Notebook Dell",
  "description": "Notebook para trabalho e estudos",
  "price": 3500.00,
  "stock_quantity": 10,
  "sku": "NB-DELL-001",
  "category": "Eletrônicos",
  "image_url": "https://exemplo.com/imagem.jpg",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Códigos de erro**:
- `404`: Produto não encontrado

---

### Criar Produto
```http
POST /products
```

**Request Body**:
```json
{
  "name": "Notebook Dell",
  "description": "Notebook para trabalho e estudos",
  "price": 3500.00,
  "stock_quantity": 10,
  "sku": "NB-DELL-001",
  "category": "Eletrônicos",
  "image_url": "https://exemplo.com/imagem.jpg",
  "is_active": true
}
```

**Response**: `201 Created`
```json
{
  "id": 1,
  "name": "Notebook Dell",
  "description": "Notebook para trabalho e estudos",
  "price": 3500.00,
  "stock_quantity": 10,
  "sku": "NB-DELL-001",
  "category": "Eletrônicos",
  "image_url": "https://exemplo.com/imagem.jpg",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### Atualizar Produto
```http
PUT /products/{id}
```

**Request Body**: (campos opcionais)
```json
{
  "name": "Notebook Dell Atualizado",
  "price": 3200.00,
  "stock_quantity": 8,
  "is_active": false
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "Notebook Dell Atualizado",
  "description": "Notebook para trabalho e estudos",
  "price": 3200.00,
  "stock_quantity": 8,
  "sku": "NB-DELL-001",
  "category": "Eletrônicos",
  "image_url": "https://exemplo.com/imagem.jpg",
  "is_active": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:45:00Z"
}
```

---

### Deletar Produto
```http
DELETE /products/{id}
```

**Response**: `204 No Content`

---

### Estatísticas de Produtos
```http
GET /products/stats
```

**Response**: `200 OK`
```json
{
  "total_products": 150,
  "active_products": 145,
  "total_value": 525000.00,
  "low_stock_count": 5
}
```

---

### Sincronizar Produto com Marketplace
```http
POST /products/{id}/sync/{marketplace}
```

**Path Parameters**:
- `id`: ID do produto
- `marketplace`: nome do marketplace (mercadolivre, amazon, magalu)

**Response**: `200 OK`
```json
{
  "status": "success",
  "message": "Produto sincronizado com sucesso",
  "marketplace_product_id": "MLB123456789"
}
```

---

### Obter Status de Sincronização
```http
GET /products/{id}/sync-status
```

**Response**: `200 OK`
```json
{
  "mercadolivre": {
    "status": "synced",
    "last_sync": "2024-01-15T10:30:00Z",
    "marketplace_product_id": "MLB123456789"
  },
  "amazon": {
    "status": "not_synced",
    "last_sync": null,
    "marketplace_product_id": null
  }
}
```

---

## Pedidos

### Listar Pedidos
```http
GET /orders?skip=0&limit=10&status=pending&start_date=2024-01-01&end_date=2024-01-31
```

**Query Parameters**:
- `skip` (opcional): Offset para paginação
- `limit` (opcional): Limite de resultados
- `status` (opcional): Filtrar por status (pending, confirmed, shipped, delivered, cancelled)
- `start_date` (opcional): Data inicial (formato: YYYY-MM-DD)
- `end_date` (opcional): Data final (formato: YYYY-MM-DD)

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "order_number": "ORD-2024-001",
    "status": "pending",
    "total_amount": 3500.00,
    "marketplace": "mercadolivre",
    "marketplace_order_id": "ML123456",
    "customer_name": "João Silva",
    "customer_email": "joao@exemplo.com",
    "customer_phone": "(11) 98765-4321",
    "shipping_address": {
      "street": "Rua Exemplo",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zip_code": "01234-567"
    },
    "tracking_code": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Obter Pedido por ID
```http
GET /orders/{id}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "order_number": "ORD-2024-001",
  "status": "pending",
  "total_amount": 3500.00,
  "marketplace": "mercadolivre",
  "marketplace_order_id": "ML123456",
  "customer_name": "João Silva",
  "customer_email": "joao@exemplo.com",
  "customer_phone": "(11) 98765-4321",
  "shipping_address": {
    "street": "Rua Exemplo",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567"
  },
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Notebook Dell",
      "quantity": 1,
      "unit_price": 3500.00,
      "total_price": 3500.00
    }
  ],
  "payment_info": {
    "method": "credit_card",
    "subtotal": 3500.00,
    "shipping_cost": 50.00,
    "marketplace_fee": 350.00,
    "tax": 150.00,
    "total": 3500.00,
    "net_amount": 3000.00
  },
  "tracking_code": "BR123456789",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### Criar Pedido
```http
POST /orders
```

**Request Body**:
```json
{
  "marketplace": "mercadolivre",
  "marketplace_order_id": "ML123456",
  "customer_name": "João Silva",
  "customer_email": "joao@exemplo.com",
  "customer_phone": "(11) 98765-4321",
  "shipping_address": {
    "street": "Rua Exemplo",
    "number": "123",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567"
  },
  "items": [
    {
      "product_id": 1,
      "quantity": 1,
      "unit_price": 3500.00
    }
  ]
}
```

**Response**: `201 Created`

---

### Atualizar Status do Pedido
```http
PUT /orders/{id}/status
```

**Request Body**:
```json
{
  "status": "confirmed",
  "tracking_code": "BR123456789"
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "status": "confirmed",
  "tracking_code": "BR123456789",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

**Status válidos**:
- `pending`: Aguardando confirmação
- `confirmed`: Confirmado
- `shipped`: Enviado
- `delivered`: Entregue
- `cancelled`: Cancelado

---

### Processar Pedido (Job em Background)
```http
POST /orders/{id}/process
```

**Response**: `202 Accepted`
```json
{
  "job_id": "abc123-def456",
  "status": "queued",
  "message": "Pedido adicionado à fila de processamento"
}
```

---

### Estatísticas de Pedidos
```http
GET /orders/stats
```

**Response**: `200 OK`
```json
{
  "total_orders": 45,
  "total_revenue": 50000.00,
  "average_order_value": 1111.11,
  "by_status": {
    "pending": 5,
    "confirmed": 10,
    "shipped": 20,
    "delivered": 8,
    "cancelled": 2
  },
  "by_marketplace": {
    "mercadolivre": 25,
    "amazon": 15,
    "magalu": 5
  }
}
```

---

## Integrações

### Listar Integrações
```http
GET /marketplace-integrations/
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "marketplace": "mercadolivre",
    "credentials": {
      "access_token": "APP_USR-***",
      "refresh_token": "TG-***"
    },
    "is_active": true,
    "last_sync": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-10T08:00:00Z"
  }
]
```

---

### Obter Integração por ID
```http
GET /marketplace-integrations/{id}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "marketplace": "mercadolivre",
  "credentials": {
    "access_token": "APP_USR-***",
    "refresh_token": "TG-***"
  },
  "is_active": true,
  "last_sync": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-10T08:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### Criar Integração
```http
POST /marketplace-integrations/
```

**Request Body (Mercado Livre)**:
```json
{
  "marketplace": "mercadolivre",
  "credentials": {
    "access_token": "APP_USR-123456",
    "refresh_token": "TG-789012"
  },
  "is_active": true
}
```

**Request Body (Amazon)**:
```json
{
  "marketplace": "amazon",
  "credentials": {
    "seller_id": "A1B2C3D4E5",
    "mws_auth_token": "amzn.mws.***",
    "marketplace_id": "A2Q3Y263D00KWC"
  },
  "is_active": true
}
```

**Request Body (Magazine Luiza)**:
```json
{
  "marketplace": "magalu",
  "credentials": {
    "api_key": "mglu-api-key-***",
    "seller_id": "SELLER123"
  },
  "is_active": true
}
```

**Response**: `201 Created`

---

### Atualizar Integração
```http
PUT /marketplace-integrations/{id}
```

**Request Body**: (campos opcionais)
```json
{
  "credentials": {
    "access_token": "APP_USR-novo-token"
  },
  "is_active": false
}
```

**Response**: `200 OK`

---

### Deletar Integração
```http
DELETE /marketplace-integrations/{id}
```

**Response**: `204 No Content`

---

### Testar Conexão
```http
POST /marketplace-integrations/{id}/test-connection
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "message": "Conexão estabelecida com sucesso",
  "details": {
    "marketplace": "mercadolivre",
    "user_id": "123456789",
    "nickname": "LOJA_EXEMPLO"
  }
}
```

**Resposta de erro**: `400 Bad Request`
```json
{
  "status": "error",
  "message": "Falha na autenticação",
  "error": "Invalid access token"
}
```

---

### Estatísticas da Integração
```http
GET /marketplace-integrations/{id}/stats
```

**Response**: `200 OK`
```json
{
  "total_products": 50,
  "synced_products": 48,
  "total_orders": 25,
  "last_sync": "2024-01-15T10:30:00Z",
  "sync_success_rate": 96.0
}
```

---

## Logs de Sincronização

### Listar Logs
```http
GET /sync-logs/?skip=0&limit=10&marketplace=mercadolivre&status=error&operation=update
```

**Query Parameters**:
- `skip` (opcional): Offset para paginação
- `limit` (opcional): Limite de resultados
- `marketplace` (opcional): Filtrar por marketplace
- `product_id` (opcional): Filtrar por produto
- `status` (opcional): Filtrar por status (success, error, pending)
- `operation` (opcional): Filtrar por operação (create, update, delete, sync)
- `start_date` (opcional): Data inicial
- `end_date` (opcional): Data final

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "product_id": 1,
    "marketplace": "mercadolivre",
    "marketplace_product_id": "MLB123456789",
    "operation": "update",
    "status": "error",
    "request_data": {
      "title": "Notebook Dell",
      "price": 3500.00
    },
    "response_data": null,
    "error_message": "Produto não encontrado no marketplace",
    "duration_ms": 1500,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:01Z"
  }
]
```

---

### Obter Log por ID
```http
GET /sync-logs/{id}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "product_id": 1,
  "marketplace": "mercadolivre",
  "marketplace_product_id": "MLB123456789",
  "operation": "update",
  "status": "error",
  "request_data": {
    "title": "Notebook Dell",
    "price": 3500.00,
    "available_quantity": 10
  },
  "response_data": {
    "error": "not_found",
    "message": "Item not found",
    "status": 404
  },
  "error_message": "Produto não encontrado no marketplace",
  "duration_ms": 1500,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:01Z"
}
```

---

### Deletar Log
```http
DELETE /sync-logs/{id}
```

**Response**: `204 No Content`

---

### Obter Logs por Produto
```http
GET /sync-logs/product/{product_id}/logs
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "marketplace": "mercadolivre",
    "operation": "create",
    "status": "success",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "marketplace": "mercadolivre",
    "operation": "update",
    "status": "error",
    "created_at": "2024-01-15T11:00:00Z"
  }
]
```

---

### Estatísticas de Logs
```http
GET /sync-logs/stats/summary
```

**Response**: `200 OK`
```json
{
  "total_logs": 150,
  "by_status": {
    "success": 120,
    "error": 25,
    "pending": 5
  },
  "by_marketplace": {
    "mercadolivre": 80,
    "amazon": 50,
    "magalu": 20
  },
  "by_operation": {
    "create": 30,
    "update": 80,
    "delete": 10,
    "sync": 30
  },
  "average_duration_ms": 850,
  "success_rate": 80.0
}
```

---

## Marketplace Links

### Listar Links
```http
GET /marketplace-links/?marketplace=mercadolivre&sync_status=synced
```

**Query Parameters**:
- `skip` (opcional): Offset para paginação
- `limit` (opcional): Limite de resultados
- `marketplace` (opcional): Filtrar por marketplace
- `sync_status` (opcional): Filtrar por status de sincronização
- `product_id` (opcional): Filtrar por produto

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "product_id": 1,
    "marketplace": "mercadolivre",
    "marketplace_product_id": "MLB123456789",
    "marketplace_url": "https://produto.mercadolivre.com.br/MLB-123456789",
    "sync_status": "synced",
    "last_sync": "2024-01-15T10:30:00Z",
    "is_active": true,
    "created_at": "2024-01-10T08:00:00Z"
  }
]
```

---

### Obter Link por ID
```http
GET /marketplace-links/{id}
```

**Response**: `200 OK`

---

### Criar Link
```http
POST /marketplace-links/
```

**Request Body**:
```json
{
  "product_id": 1,
  "marketplace": "mercadolivre",
  "marketplace_product_id": "MLB123456789",
  "marketplace_url": "https://produto.mercadolivre.com.br/MLB-123456789",
  "is_active": true
}
```

**Response**: `201 Created`

---

### Atualizar Link
```http
PUT /marketplace-links/{id}
```

**Request Body**: (campos opcionais)
```json
{
  "sync_status": "synced",
  "is_active": false
}
```

**Response**: `200 OK`

---

### Deletar Link
```http
DELETE /marketplace-links/{id}
```

**Response**: `204 No Content`

---

### Disparar Sincronização
```http
POST /marketplace-links/{id}/sync
```

**Response**: `202 Accepted`
```json
{
  "job_id": "abc123-def456",
  "status": "queued",
  "message": "Sincronização adicionada à fila"
}
```

---

### Obter Links por Produto
```http
GET /marketplace-links/product/{product_id}/links
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "marketplace": "mercadolivre",
    "marketplace_product_id": "MLB123456789",
    "sync_status": "synced",
    "last_sync": "2024-01-15T10:30:00Z"
  }
]
```

---

### Estatísticas de Links
```http
GET /marketplace-links/stats/summary
```

**Response**: `200 OK`
```json
{
  "total_links": 150,
  "active_links": 145,
  "by_marketplace": {
    "mercadolivre": 80,
    "amazon": 50,
    "magalu": 20
  },
  "by_sync_status": {
    "synced": 120,
    "pending": 20,
    "error": 10
  }
}
```

---

## Jobs

### Listar Jobs
```http
GET /jobs/?limit=50&status=running
```

**Query Parameters**:
- `limit` (opcional): Limite de resultados (padrão: 50)
- `status` (opcional): Filtrar por status (pending, running, completed, failed)

**Response**: `200 OK`
```json
[
  {
    "id": "abc123-def456",
    "name": "sync_products",
    "status": "running",
    "progress": 45,
    "result": null,
    "error": null,
    "started_at": "2024-01-15T10:30:00Z",
    "finished_at": null,
    "args": {
      "marketplace": "mercadolivre"
    }
  }
]
```

---

### Obter Job por ID
```http
GET /jobs/{id}
```

**Response**: `200 OK`
```json
{
  "id": "abc123-def456",
  "name": "sync_products",
  "status": "completed",
  "progress": 100,
  "result": {
    "synced": 48,
    "errors": 2,
    "total": 50
  },
  "error": null,
  "started_at": "2024-01-15T10:30:00Z",
  "finished_at": "2024-01-15T10:35:00Z",
  "args": {
    "marketplace": "mercadolivre"
  }
}
```

---

### Cancelar Job
```http
DELETE /jobs/{id}
```

**Response**: `200 OK`
```json
{
  "status": "cancelled",
  "message": "Job cancelado com sucesso"
}
```

---

### Retry Job
```http
POST /jobs/{id}/retry
```

**Response**: `202 Accepted`
```json
{
  "job_id": "new-job-id-123",
  "status": "queued",
  "message": "Job adicionado novamente à fila"
}
```

---

### Sincronizar Produtos
```http
POST /jobs/sync-products?marketplace=mercadolivre
```

**Query Parameters**:
- `marketplace`: nome do marketplace

**Response**: `202 Accepted`
```json
{
  "job_id": "abc123-def456",
  "status": "queued"
}
```

---

### Importar Pedidos
```http
POST /jobs/import-orders?marketplace=amazon
```

**Query Parameters**:
- `marketplace`: nome do marketplace

**Response**: `202 Accepted`

---

### Executar Análise de Inventário
```http
POST /jobs/inventory-analysis
```

**Response**: `202 Accepted`

---

### Executar Otimização de Estoque
```http
POST /jobs/stock-optimization
```

**Response**: `202 Accepted`

---

### Enviar Resumo Semanal
```http
POST /jobs/send-weekly-summary
```

**Response**: `202 Accepted`

---

### Estatísticas de Jobs
```http
GET /jobs/stats/summary
```

**Response**: `200 OK`
```json
{
  "total_jobs": 500,
  "by_status": {
    "pending": 10,
    "running": 5,
    "completed": 450,
    "failed": 35
  },
  "success_rate": 92.8,
  "average_duration_seconds": 120
}
```

---

### Estatísticas de Filas
```http
GET /jobs/stats/queues
```

**Response**: `200 OK`
```json
{
  "queues": [
    {
      "name": "default",
      "jobs_waiting": 5,
      "jobs_running": 2
    },
    {
      "name": "high_priority",
      "jobs_waiting": 1,
      "jobs_running": 1
    }
  ]
}
```

---

## Privacidade/LGPD

### Obter Política de Privacidade
```http
GET /privacy/policy
```

**Response**: `200 OK`
```json
{
  "version": "1.0",
  "last_updated": "2024-01-01",
  "content": "Política de privacidade completa em texto...",
  "sections": [
    {
      "title": "Coleta de Dados",
      "content": "..."
    }
  ]
}
```

---

### Obter Status de Consentimento
```http
GET /privacy/consent-status
```

**Response**: `200 OK`
```json
{
  "user_id": 1,
  "consents": {
    "data_processing": true,
    "marketing": false,
    "analytics": true
  },
  "last_updated": "2024-01-15T10:30:00Z"
}
```

---

### Solicitar Exportação de Dados
```http
POST /privacy/data-request
```

**Response**: `202 Accepted`
```json
{
  "request_id": "req-123456",
  "status": "processing",
  "message": "Sua solicitação está sendo processada. Você receberá um email quando estiver pronta."
}
```

---

### Exportar Dados do Usuário
```http
GET /privacy/export-data
```

**Response**: `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "products": [...],
  "orders": [...],
  "integrations": [...],
  "consent_history": [...]
}
```

---

### Solicitar Exclusão de Conta
```http
POST /privacy/delete-account
```

**Response**: `202 Accepted`
```json
{
  "request_id": "del-123456",
  "status": "scheduled",
  "scheduled_for": "2024-02-15T00:00:00Z",
  "message": "Sua conta será excluída em 30 dias. Você pode cancelar até lá."
}
```

---

### Retificar Dados
```http
POST /privacy/rectify-data
```

**Request Body**:
```json
{
  "field": "name",
  "old_value": "Nome Antigo",
  "new_value": "Nome Novo",
  "reason": "Correção de dados pessoais"
}
```

**Response**: `200 OK`
```json
{
  "status": "updated",
  "message": "Dados atualizados com sucesso"
}
```

---

### Obter Atividades de Processamento
```http
GET /privacy/processing-activities
```

**Response**: `200 OK`
```json
{
  "activities": [
    {
      "id": 1,
      "name": "Processamento de Pedidos",
      "purpose": "Gerenciamento e entrega de pedidos",
      "legal_basis": "Execução de contrato",
      "data_types": ["nome", "endereço", "email", "telefone"],
      "retention_period": "5 anos após última compra",
      "sharing": ["marketplaces", "transportadoras"]
    },
    {
      "id": 2,
      "name": "Sincronização com Marketplaces",
      "purpose": "Atualização de produtos e pedidos",
      "legal_basis": "Legítimo interesse",
      "data_types": ["produtos", "preços", "estoque"],
      "retention_period": "Enquanto integração estiver ativa",
      "sharing": ["Mercado Livre", "Amazon", "Magazine Luiza"]
    }
  ]
}
```

---

## Health Check

### Verificar Saúde da API
```http
GET /health
```

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "celery": "healthy"
  }
}
```

---

## Autenticação e Headers

### Headers Padrão
Todas as requisições autenticadas devem incluir:

```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Tratamento de Erros

#### 401 Unauthorized
Token expirado ou inválido. O frontend redireciona automaticamente para `/auth/login`.

```json
{
  "detail": "Could not validate credentials"
}
```

#### 403 Forbidden
Usuário sem permissão para acessar o recurso.

```json
{
  "detail": "Not enough permissions"
}
```

#### 404 Not Found
Recurso não encontrado.

```json
{
  "detail": "Resource not found"
}
```

#### 422 Unprocessable Entity
Erro de validação de dados.

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

#### 500 Internal Server Error
Erro interno do servidor.

```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

A API implementa rate limiting para proteger contra abuso:

- **Limite padrão**: 100 requisições por minuto por IP
- **Endpoints de autenticação**: 5 tentativas por minuto por IP
- **Endpoints de jobs**: 10 requisições por minuto por usuário

Headers de resposta:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

---

## Paginação

Endpoints que retornam listas suportam paginação:

**Query Parameters**:
- `skip`: número de items a pular (padrão: 0)
- `limit`: número máximo de items a retornar (padrão: 10, máximo: 100)

**Exemplo**:
```http
GET /products?skip=20&limit=10
```

Retorna items 21-30.

---

## Webhooks (Futuro)

Em desenvolvimento: sistema de webhooks para notificações em tempo real de eventos como:
- Novo pedido criado
- Status de pedido atualizado
- Produto sincronizado
- Job concluído
- Erro de sincronização

---

## Versionamento

A API atualmente está na versão 1.0. Futuras versões incluirão o número da versão na URL:

```
/api/v2/products
```

A versão atual (v1) está disponível sem prefixo de versão.

---

## Ambientes

### Desenvolvimento
```
Base URL: http://localhost:8000
Docs: http://localhost:8000/docs
```

### Produção (quando disponível)
```
Base URL: https://api.exemplo.com
Docs: https://api.exemplo.com/docs
```

---

## Suporte

Para questões sobre a API:
- Documentação interativa: `/docs` (Swagger UI)
- Documentação alternativa: `/redoc` (ReDoc)
- Issues: GitHub repository
