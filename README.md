# Gestão Marketplace - Frontend

Frontend Next.js para o sistema de gestão de estoque integrado com marketplaces brasileiros.

## Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de CSS utilitário
- **Radix UI** - Componentes de UI acessíveis
- **Zustand** - Gerenciamento de estado
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de esquemas
- **Axios** - Cliente HTTP
- **React Toastify** - Notificações
- **Lucide React** - Ícones

## Estrutura do Projeto

```
app_frontend/
├── app/                    # App Router (Next.js 13+)
│   ├── auth/              # Páginas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Dashboard principal
│   ├── products/          # Gestão de produtos
│   ├── orders/            # Gestão de pedidos
│   ├── jobs/              # Monitoramento de jobs
│   ├── privacy/           # LGPD/Privacidade
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de UI base
│   ├── AuthGuard.tsx     # Proteção de rotas
│   ├── Sidebar.tsx       # Menu lateral
│   └── DashboardLayout.tsx
├── lib/                  # Utilitários e configurações
│   ├── api.ts           # Cliente HTTP e endpoints
│   └── utils.ts         # Funções utilitárias
├── stores/              # Gerenciamento de estado
│   └── authStore.ts     # Estado de autenticação
├── types/               # Definições TypeScript
│   └── index.ts         # Tipos principais
└── hooks/               # React Hooks customizados
```

## Funcionalidades

### 🔐 Autenticação
- Login/Registro com JWT
- Proteção de rotas
- Logout automático em caso de token expirado

### 📊 Dashboard
- Visão geral de produtos e pedidos
- Estatísticas em tempo real
- Pedidos recentes

### 📦 Gestão de Produtos
- CRUD completo de produtos
- Busca e filtros
- Upload de imagens
- Sincronização com marketplaces
- Controle de estoque

### 🛒 Gestão de Pedidos
- Visualização de pedidos
- Atualização de status
- Filtros por data e status
- Detalhamento completo

### ⚙️ Jobs em Background
- Monitoramento de sincronizações
- Status de tarefas
- Logs de execução
- Retry de jobs falhados

### 🛡️ Privacidade e LGPD
- Exportação de dados
- Exclusão de dados
- Retificação de informações
- Log de auditoria

## Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

1. **Instalar dependências:**
```bash
cd app_frontend
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Execução

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm run start
```

## Integração com Backend

O frontend consome a API FastAPI através dos seguintes endpoints:

### Autenticação
- `POST /auth/register` - Cadastro
- `POST /auth/login` - Login

### Produtos
- `GET /products` - Listar produtos
- `POST /products` - Criar produto
- `GET /products/{id}` - Detalhes do produto
- `PUT /products/{id}` - Atualizar produto
- `DELETE /products/{id}` - Excluir produto

### Pedidos
- `GET /orders` - Listar pedidos
- `POST /orders` - Criar pedido
- `GET /orders/{id}` - Detalhes do pedido
- `PUT /orders/{id}/status` - Atualizar status

### Jobs
- `GET /jobs` - Listar jobs
- `POST /jobs/sync-products` - Sincronizar produtos
- `POST /jobs/sync-orders` - Sincronizar pedidos

### Privacidade
- `GET /privacy/export` - Exportar dados
- `DELETE /privacy/delete` - Excluir dados
- `PUT /privacy/rectify` - Retificar dados

## Características de UX

### Design System
- Componentes consistentes com Radix UI
- Sistema de cores acessível
- Tipografia hierárquica
- Espaçamento padronizado

### Responsividade
- Design mobile-first
- Layout adaptativo
- Componentes flexíveis

### Performance
- Loading states em todas as operações
- Lazy loading de componentes
- Otimização de imagens
- Cache de requisições

### Acessibilidade
- Suporte a leitores de tela
- Navegação por teclado
- Contraste adequado
- Labels descritivos

### Experiência do Usuário
- Feedback visual imediato
- Notificações toast
- Estados de erro claros
- Confirmações para ações destrutivas
- Busca em tempo real
- Filtros intuitivos

## Próximos Passos

- [ ] Implementar upload de imagens
- [ ] Adicionar relatórios avançados
- [ ] Dashboard com gráficos
- [ ] Notificações em tempo real
- [ ] PWA (Progressive Web App)
- [ ] Testes automatizados
- [ ] Storybook para componentes

## Desenvolvimento

Para contribuir com o projeto:

1. Siga os padrões de código estabelecidos
2. Use TypeScript para tipagem
3. Componentes devem ser funcionais
4. Implemente testes quando necessário
5. Documente mudanças significativas