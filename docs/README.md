# Gestão Marketplace - Frontend

## 📖 Documentação do Sistema

Sistema completo de gestão de estoque para marketplaces brasileiros desenvolvido com Next.js 14 e integrado com FastAPI.

---

## 🚀 Visão Geral

O **Gestão Marketplace Frontend** é uma aplicação web moderna desenvolvida para gerenciar produtos, pedidos e sincronizações com múltiplos marketplaces brasileiros (Mercado Livre, Amazon, Magazine Luiza).

### Tecnologias Principais

- **Next.js 14.2** - Framework React com SSR
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Zustand** - Gerenciamento de estado
- **React Hook Form + Zod** - Validação de formulários
- **Axios** - Requisições HTTP
- **React Toastify** - Notificações

---

## 📂 Estrutura do Projeto

```
app_frontend/
├── app/                          # Páginas Next.js (App Router)
│   ├── auth/                     # Autenticação
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/                # Dashboard principal
│   ├── products/                 # Gestão de produtos
│   │   ├── new/                  # Criar produto
│   │   └── [id]/                 # Detalhes e edição
│   ├── orders/                   # Gestão de pedidos
│   │   └── [id]/                 # Detalhes do pedido
│   ├── integrations/             # Integrações com marketplaces
│   │   ├── new/                  # Nova integração
│   │   └── [id]/                 # Configurar integração
│   ├── sync-logs/                # Logs de sincronização
│   │   └── [id]/                 # Detalhes do log
│   ├── jobs/                     # Tarefas em background
│   └── privacy/                  # LGPD/Privacidade
├── components/                   # Componentes reutilizáveis
│   ├── ui/                       # Componentes UI base
│   ├── AuthGuard.tsx             # Proteção de rotas
│   ├── DashboardLayout.tsx       # Layout do dashboard
│   └── Sidebar.tsx               # Menu lateral
├── lib/                          # Bibliotecas e utilitários
│   ├── api.ts                    # Cliente API e endpoints
│   └── utils.ts                  # Funções auxiliares
├── stores/                       # Stores Zustand
│   └── authStore.ts              # Store de autenticação
├── types/                        # Definições TypeScript
│   └── index.ts                  # Tipos e interfaces
└── docs/                         # Documentação
    ├── README.md                 # Este arquivo
    ├── IMPLEMENTACOES.md         # Changelog de implementações
    └── API.md                    # Documentação da API
```

---

## 🎯 Funcionalidades Implementadas

### 1. Autenticação e Autorização ✅

#### Características:
- Login com email e senha
- Registro de novos usuários
- Gestão de sessão com JWT tokens
- Proteção de rotas privadas
- Logout seguro
- Refresh automático de dados do usuário

#### Endpoints Utilizados:
- `POST /auth/login` - Autenticação
- `POST /auth/register` - Registro
- `GET /users/me` - Dados do usuário atual

#### Arquivos:
- `app/auth/login/page.tsx`
- `app/auth/register/page.tsx`
- `stores/authStore.ts`
- `components/AuthGuard.tsx`

---

### 2. Dashboard ✅

#### Características:
- Visão geral com estatísticas em tempo real
- Cards informativos:
  - Total de produtos (ativos/inativos)
  - Estoque total (unidades e valor)
  - Total de pedidos (pendentes)
  - Receita total e ticket médio
- Pedidos recentes
- Mensagem personalizada de boas-vindas

#### Endpoints Utilizados:
- `GET /dashboard/overview` - Estatísticas gerais
- `GET /dashboard/products/stats` - Estatísticas de produtos
- `GET /dashboard/orders/stats` - Estatísticas de pedidos
- `GET /dashboard/alerts` - Alertas do sistema

#### Arquivos:
- `app/dashboard/page.tsx`
- `lib/api.ts` (dashboardApi)

---

### 3. Gestão de Produtos ✅

#### Características:
- **Listagem:**
  - Busca por nome, SKU ou categoria
  - Visualização em cards com imagens
  - Indicadores de estoque (baixo, zero, normal)
  - Status ativo/inativo

- **Criar Produto:**
  - Formulário validado (Zod)
  - Campos: nome, SKU, preço, estoque, categoria, imagem, descrição
  - Upload de URL de imagem

- **Visualizar Produto:**
  - Detalhes completos
  - Valor total em estoque
  - Histórico (criação, atualização)

- **Editar Produto:**
  - Atualização de todos os campos
  - Toggle ativo/inativo

- **Deletar Produto:**
  - Confirmação antes de excluir

#### Endpoints Utilizados:
- `GET /products/` - Listar produtos
- `POST /products/` - Criar produto
- `GET /products/{id}` - Buscar produto
- `PUT /products/{id}` - Atualizar produto
- `DELETE /products/{id}` - Deletar produto

#### Arquivos:
- `app/products/page.tsx` - Listagem
- `app/products/new/page.tsx` - Criar
- `app/products/[id]/page.tsx` - Visualizar
- `app/products/[id]/edit/page.tsx` - Editar

---

### 4. Gestão de Pedidos ✅

#### Características:
- **Listagem:**
  - Busca por número, cliente ou email
  - Filtros por status
  - Informações resumidas (cliente, endereço, total, data)
  - Badge de marketplace

- **Visualizar Pedido:**
  - Dados do cliente completos
  - Endereço de entrega
  - Código de rastreio
  - Itens do pedido com imagens
  - Breakdown de pagamento:
    - Subtotal
    - Frete
    - Impostos
    - Descontos
    - Taxas (marketplace e pagamento)
    - Valor líquido

- **Atualizar Status:**
  - Workflow: Pendente → Confirmado → Enviado → Entregue
  - Botões contextuais por status

- **Cancelar Pedido:**
  - Disponível para pedidos não finalizados

#### Endpoints Utilizados:
- `GET /orders/` - Listar pedidos
- `GET /orders/{id}` - Buscar pedido
- `PUT /orders/{id}/status` - Atualizar status
- `POST /orders/{id}/cancel` - Cancelar pedido
- `GET /orders/stats/summary` - Estatísticas

#### Arquivos:
- `app/orders/page.tsx` - Listagem
- `app/orders/[id]/page.tsx` - Detalhes

---

### 5. Integrações com Marketplaces ✅

#### Características:
- **Listar Integrações:**
  - Cards visuais por marketplace
  - Status de conexão (conectado/desconectado)
  - Status ativo/inativo
  - Frequência de sincronização
  - Última sincronização

- **Criar Integração:**
  - Suporte a múltiplos marketplaces:
    - Mercado Livre (com OAuth tokens)
    - Amazon
    - Magazine Luiza
  - Configuração de API keys e secrets
  - Auto-sync habilitável
  - Frequências: manual, hourly, daily, weekly

- **Testar Conexão:**
  - Validação em tempo real
  - Feedback visual

- **Configurar:**
  - Editar credenciais
  - Ajustar frequência de sync

#### Endpoints Utilizados:
- `GET /marketplace-integrations/` - Listar integrações
- `POST /marketplace-integrations/` - Criar integração
- `GET /marketplace-integrations/{id}` - Buscar integração
- `PUT /marketplace-integrations/{id}` - Atualizar integração
- `DELETE /marketplace-integrations/{id}` - Deletar integração
- `POST /marketplace-integrations/{id}/test-connection` - Testar conexão
- `GET /marketplace-integrations/{id}/stats` - Estatísticas

#### Arquivos:
- `app/integrations/page.tsx` - Listagem
- `app/integrations/new/page.tsx` - Criar
- `app/integrations/[id]/page.tsx` - Configurar

---

### 6. Logs de Sincronização ✅

#### Características:
- **Listagem de Logs:**
  - Busca por ID do produto ou mensagem de erro
  - Filtros múltiplos:
    - Status (sucesso/erro/pendente)
    - Marketplace
    - Operação (create/update/delete/sync)
  - Informações por log:
    - Ícone da operação
    - Status visual
    - Produto vinculado (link)
    - ID no marketplace
    - Duração da operação
    - Timestamp

- **Visualizar Log:**
  - Detalhes completos da sincronização
  - Dados da requisição (JSON)
  - Resposta do marketplace (JSON)
  - Mensagens de erro detalhadas
  - Duração em milissegundos
  - Link para o produto

- **Deletar Logs:**
  - Limpeza de logs antigos

- **Features Especiais:**
  - Expandir/colapsar resposta do marketplace
  - Highlight de erros
  - Auto-refresh opcional

#### Endpoints Utilizados:
- `GET /sync-logs/` - Listar logs
- `GET /sync-logs/{id}` - Buscar log
- `DELETE /sync-logs/{id}` - Deletar log
- `GET /sync-logs/product/{product_id}/logs` - Logs por produto
- `GET /sync-logs/stats/summary` - Estatísticas

#### Arquivos:
- `app/sync-logs/page.tsx` - Listagem
- `app/sync-logs/[id]/page.tsx` - Detalhes

---

### 7. Gestão de Jobs ✅

#### Características:
- **Monitoramento de Jobs:**
  - Lista de todos os jobs do usuário
  - Auto-refresh a cada 5 segundos
  - Filtro por status
  - Informações:
    - Nome da tarefa (traduzido)
    - Status visual
    - Job ID
    - Timestamps (criado, iniciado, concluído)
    - Mensagens de erro
    - Resultados (JSON)

- **Ações Rápidas:**
  - Análise de inventário
  - Otimização de estoque
  - Resumo semanal
  - Sync de produtos
  - Importar pedidos

- **Gerenciar Jobs:**
  - Retry de jobs falhados
  - Cancelar jobs pendentes/em progresso

- **Visualização:**
  - Erros em destaque (vermelho)
  - Resultados expandíveis
  - Estados: pending, in_progress, completed, failed

#### Endpoints Utilizados:
- `GET /jobs/` - Listar jobs
- `GET /jobs/{id}` - Buscar job
- `DELETE /jobs/{id}` - Cancelar job
- `POST /jobs/{id}/retry` - Tentar novamente
- `POST /jobs/sync-products` - Sync produtos
- `POST /jobs/import-orders` - Importar pedidos
- `POST /jobs/inventory-analysis` - Análise de inventário
- `POST /jobs/stock-optimization` - Otimização
- `POST /jobs/send-weekly-summary` - Resumo semanal
- `GET /jobs/stats/summary` - Estatísticas
- `GET /jobs/stats/queues` - Stats de filas

#### Arquivos:
- `app/jobs/page.tsx`

---

### 8. Privacidade e LGPD ✅

#### Características:
- **Banner Informativo:**
  - Direitos do usuário sob a LGPD
  - Arte 18 da LGPD

- **Exportar Dados:**
  - Download de todos os dados pessoais
  - Formato JSON
  - Inclui: perfil, produtos, pedidos, atividades

- **Política de Privacidade:**
  - Documento completo em português
  - Seções: coleta, uso, compartilhamento, segurança

- **Atividades de Processamento:**
  - Lista transparente de como os dados são usados
  - Base legal para cada processamento
  - Tipos de dados processados

- **Solicitar Exclusão:**
  - Zona de perigo
  - Confirmação dupla
  - Processo de exclusão em até 30 dias
  - Notificação por email

- **Contato DPO:**
  - Email do encarregado de dados
  - Prazo de resposta (15 dias úteis)

#### Endpoints Utilizados:
- `GET /privacy/policy` - Política de privacidade
- `GET /privacy/consent-status` - Status de consentimentos
- `POST /privacy/data-request` - Solicitar exportação
- `GET /privacy/export-data` - Exportar dados
- `POST /privacy/delete-account` - Solicitar exclusão
- `POST /privacy/rectify-data` - Retificar dados
- `GET /privacy/processing-activities` - Atividades de processamento

#### Arquivos:
- `app/privacy/page.tsx`

---

## 🔧 Configuração e Instalação

### Requisitos
- Node.js 18+
- npm ou yarn
- Backend FastAPI rodando

### Instalação

```bash
# Clonar repositório
cd app_frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Editar .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Executar

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

---

## 🎨 Componentes UI

### Componentes Base (components/ui/)
- `Button` - Botões com variantes
- `Input` - Campos de texto
- `Card` - Cards informativos

### Componentes de Layout
- `Sidebar` - Menu lateral com navegação
- `DashboardLayout` - Layout padrão das páginas
- `AuthGuard` - Proteção de rotas privadas

---

## 📡 API Client

### Estrutura (lib/api.ts)

```typescript
// Configuração base
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

// Interceptors
- Request: Adiciona token JWT
- Response: Trata erro 401 (redirect para login)

// APIs disponíveis:
- authApi
- productsApi
- ordersApi
- integrationsApi
- syncLogsApi
- marketplaceLinksApi
- jobsApi
- privacyApi
- dashboardApi
```

---

## 🔐 Autenticação

### Fluxo

1. **Login:**
   - Usuário envia credenciais
   - Backend retorna JWT token
   - Token salvo no localStorage
   - Redirect para dashboard

2. **Proteção de Rotas:**
   - AuthGuard verifica token
   - Se não autenticado, redirect para login
   - Se autenticado, carrega dados do usuário

3. **Logout:**
   - Remove token do localStorage
   - Limpa state do Zustand
   - Redirect para login

---

## 📊 Gerenciamento de Estado

### Zustand Store (authStore.ts)

```typescript
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (credentials) => Promise<void>
  register: (userData) => Promise<void>
  logout: () => void
  loadUser: () => void
}
```

---

## 🎯 Validação de Formulários

### Tecnologias
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Esquemas de validação

### Exemplo:

```typescript
const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.string().min(1, 'Preço é obrigatório'),
  stock_quantity: z.string().min(0),
  sku: z.string().min(1, 'SKU é obrigatório'),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(productSchema)
})
```

---

## 🎨 Estilização

### Tailwind CSS
- Utility-first CSS framework
- Responsivo (mobile-first)
- Dark mode ready (não implementado ainda)

### Cores do Sistema
- Primary: Blue-600
- Success: Green-600
- Warning: Yellow-600
- Danger: Red-600
- Gray scale: 50-900

---

## 🚦 Navegação

### Rotas Públicas
- `/auth/login` - Login
- `/auth/register` - Registro

### Rotas Privadas (protegidas por AuthGuard)
- `/dashboard` - Dashboard
- `/products` - Produtos
- `/products/new` - Criar produto
- `/products/[id]` - Ver produto
- `/products/[id]/edit` - Editar produto
- `/orders` - Pedidos
- `/orders/[id]` - Ver pedido
- `/integrations` - Integrações
- `/integrations/new` - Nova integração
- `/sync-logs` - Logs de sincronização
- `/sync-logs/[id]` - Detalhes do log
- `/jobs` - Jobs
- `/privacy` - Privacidade

---

## 📱 Responsividade

Todas as páginas são responsivas e funcionam em:
- 📱 Mobile (< 640px)
- 📱 Tablet (640px - 1024px)
- 💻 Desktop (> 1024px)

Grid system adaptativo:
- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3-4 colunas

---

## ⚡ Performance

### Otimizações Implementadas
- Lazy loading de componentes
- Debounce em buscas
- Memoização de cálculos
- Auto-refresh inteligente (apenas em páginas específicas)
- Pagination/Limit em listagens

---

## 🧪 Testes

### Estrutura de Testes (não implementado)
```
tests/
├── components/
├── pages/
├── lib/
└── stores/
```

### Comandos (futuro)
```bash
npm run test
npm run test:watch
npm run test:coverage
```

---

## 📦 Build e Deploy

### Build de Produção

```bash
npm run build
```

### Deploy Sugerido
- **Vercel** (recomendado para Next.js)
- Netlify
- AWS Amplify
- Docker

### Variáveis de Ambiente Produção
```
NEXT_PUBLIC_API_URL=https://api.producao.com
```

---

## 🔍 Troubleshooting

### Problemas Comuns

1. **Erro 401 (Unauthorized):**
   - Verificar se backend está rodando
   - Verificar token no localStorage
   - Verificar expiração do token

2. **CORS Error:**
   - Verificar ALLOWED_ORIGINS no backend
   - Verificar se API_URL está correto

3. **Componentes não carregam:**
   - Verificar imports
   - npm install
   - Limpar cache: `rm -rf .next`

---

## 📚 Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

## 👥 Contribuição

### Guidelines
1. Seguir padrão de código existente
2. Criar branch para features: `feature/nome-da-feature`
3. Commit semântico: `feat:`, `fix:`, `docs:`, etc.
4. Testar antes de commit
5. Criar PR descritivo

---

## 📄 Licença

Projeto proprietário - Todos os direitos reservados

---

## 📞 Suporte

Para dúvidas ou problemas:
- Email: suporte@example.com
- Issues: GitHub Issues

---

**Desenvolvido com ❤️ usando Next.js e TypeScript**
