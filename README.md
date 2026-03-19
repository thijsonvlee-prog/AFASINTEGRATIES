# AFAS Integratieplatform

Webapplicatie die fungeert als integratieplatform voor AFAS Profit connectoren, gebaseerd op de officiële AFAS REST API.

## Functionaliteiten

- **Verbindingsbeheer** — Meerdere AFAS omgevingen configureren en beheren (test/productie)
- **GetConnector Explorer** — Data ophalen met filters, paginering en sortering, exporteren als JSON/CSV
- **Data Transformatie** — Visuele pipeline: velden hernoemen, formules toepassen, rijen filteren, berekende kolommen
- **UpdateConnector** — Data terugschrijven naar AFAS met field mapping, dry-run modus
- **Pipelines** — Herbruikbare workflows opslaan en uitvoeren (GetConnector → Transformatie → UpdateConnector)
- **Logging** — Alle API-calls loggen met request/response details

## Architectuur

```
Browser (React + Tailwind + shadcn/ui)
    ↓ HTTP
Next.js API Routes (server-side proxy)
    ↓ HTTPS
AFAS Profit REST API
```

Het AFAS App Connector token wordt **nooit** in de frontend opgeslagen — alleen server-side via encrypted sessions (iron-session).

## Vereisten

- Node.js 18+
- npm of yarn
- AFAS Profit omgeving met een App Connector

## Installatie

```bash
# Clone de repository
git clone <repo-url>
cd AFASINTEGRATIES

# Installeer dependencies
npm install

# Configureer environment variabelen
cp .env.local.example .env.local
# Pas IRON_SESSION_PASSWORD aan (minimaal 32 tekens)

# Start development server
npm run dev
```

De applicatie draait standaard op http://localhost:3000.

## App Connector configureren in AFAS

1. Log in op je AFAS Profit omgeving
2. Ga naar **Beheer** → **App Connector**
3. Klik op **Toevoegen** om een nieuwe App Connector aan te maken
4. Geef de connector een naam (bijv. "Integratieplatform")
5. Activeer de benodigde **GetConnectoren** en **UpdateConnectoren**
6. Kopieer het gegenereerde **token**
7. Voer het omgevingsnummer en token in bij de Verbindingen-pagina van het platform

### Belangrijk

- Elke GetConnector/UpdateConnector moet expliciet geactiveerd zijn in de App Connector
- Test altijd eerst in een testomgeving voordat je productiedata wijzigt
- Het token bevat de XML-structuur: `<token><version>1</version><data>...</data></token>`

## Voorbeeld Pipeline: Medewerkers salaris bijwerken

Deze pipeline haalt medewerkers op, berekent een salarisverhoging van 8%, en schrijft dit terug.

### Stap 1: GetConnector

- Connector: `Profit_Medewerker` (of jouw custom connector)
- Filter: `Actief = true`
- Velden: Medewerker_ID, Naam, BrutoSalaris

### Stap 2: Transformatie

1. **Filter** — Alleen actieve medewerkers (Actief = true)
2. **Berekend veld** — `nieuwSalaris = row.BrutoSalaris * 1.08`
3. **Hernoem** — `nieuwSalaris → Salary`, `Medewerker_ID → EmId`

### Stap 3: UpdateConnector

- Connector: `KnSalaryMut`
- Operatie: PUT (bijwerken)
- Field mapping: EmId → EmId, Salary → Salary

### Workflow

```
GetConnector "Profit_Medewerker"
  → Filter: Actief = true
  → Berekend: BrutoSalaris * 1.08 → nieuwSalaris
  → Hernoem: nieuwSalaris → Salary
  → UpdateConnector "KnSalaryMut" (PUT)
```

## Tech Stack

| Laag | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Server sessies | iron-session |
| Data opslag | JSON bestanden |
| Iconen | Lucide React |

## Projectstructuur

```
src/
├── app/                    # Next.js App Router pagina's
│   ├── api/                # Backend API routes (AFAS proxy)
│   ├── connections/        # Verbindingsbeheer
│   ├── explorer/           # GetConnector Explorer
│   ├── transform/          # Data transformatie
│   ├── update/             # UpdateConnector
│   └── pipelines/          # Pipeline manager
├── components/             # React componenten
│   ├── ui/                 # shadcn/ui basis componenten
│   ├── ConnectionManager   # Verbindingsbeheer
│   ├── ConnectorExplorer   # GetConnector data ophalen
│   ├── FilterBuilder       # Filter UI
│   ├── DataGrid            # Data tabel met export
│   ├── TransformPipeline   # Transformatie stappen editor
│   ├── UpdateConnectorPanel# UpdateConnector met field mapping
│   ├── PipelineManager     # Pipeline CRUD en uitvoering
│   └── ApiLogViewer        # API call log
├── store/                  # Zustand state stores
├── lib/                    # Server-side utilities
│   ├── afasClient.ts       # AFAS REST API client
│   ├── session.ts          # iron-session configuratie
│   ├── transformer.ts      # Data transformatie engine
│   └── storage.ts          # JSON bestand opslag
└── types/                  # TypeScript type definities
```

## API Endpoints

| Route | Methode | Functie |
|---|---|---|
| `/api/connections` | GET/POST/PUT/DELETE | CRUD verbindingsprofielen |
| `/api/connections/test` | POST | Test AFAS verbinding |
| `/api/connections/activate` | POST | Stel actieve verbinding in |
| `/api/afas/metainfo` | GET | Beschikbare connectoren |
| `/api/afas/metainfo/get/[name]` | GET | GetConnector veldinfo |
| `/api/afas/metainfo/update/[name]` | GET | UpdateConnector schema |
| `/api/afas/connectors/[name]` | GET/POST/PUT/DELETE | Connector data operaties |
| `/api/pipelines` | GET/POST/PUT/DELETE | CRUD pipelines |
| `/api/pipelines/[id]/execute` | POST | Pipeline uitvoeren |
| `/api/pipelines/[id]/log` | GET | Uitvoerlog ophalen |

## Licentie

MIT
