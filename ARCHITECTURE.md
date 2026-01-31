# Larapex Charts Documentation MCP Server Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP Client                                │
│              (Claude Desktop, IDE, etc.)                        │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ stdio (JSON-RPC)
                        │
┌───────────────────────▼─────────────────────────────────────────┐
│                Larapex Charts MCP Server                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    MCP Tools                                │ │
│  │                                                             │ │
│  │  • search_docs   - Search documentation                    │ │
│  │  • list_pages    - List all documentation pages            │ │
│  │  • get_page      - Get page content                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Data Processing Layer                          │ │
│  │                                                             │ │
│  │  • Web Scraping (cheerio)                                  │ │
│  │  • HTML Parsing & Content Extraction                       │ │
│  │  • Search & Filtering                                      │ │
│  │  • Local Caching (MD5-based)                               │ │
│  │  • Error Handling                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Cache Layer (.cache/)                          │ │
│  │                                                             │ │
│  │  • File-based cache with MD5 keys                          │ │
│  │  • Configurable TTL (default: 1 hour)                      │ │
│  │  • Automatic expiration                                    │ │
│  │  • ~98% performance improvement                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ HTTPS
                        │
┌───────────────────────▼─────────────────────────────────────────┐
│              https://larapex-charts.netlify.app/                │
│                                                                  │
│  • Examples (4 pages)                                           │
│  • Advance (5 pages)                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Documentation Categories

### Examples (4)
- installation
- simple-example
- more-charts
- customization

### Advance (5)
- charts-with-eloquent
- charts-with-inertiajs
- charts-stubs
- host-library
- support

## Configuration

Environment Variables:
- `LARAPEX_DOCS_URL`: Base URL (default: https://larapex-charts.netlify.app)
- `MAX_CONTENT_SIZE`: Max content size (default: 15000 characters)
- `CACHE_DIR`: Cache directory (default: .cache)
- `CACHE_TTL`: Cache TTL in seconds (default: 3600, set to 0 to disable)

## Technology Stack

- **Runtime**: Node.js >= 20.18.1
- **Language**: TypeScript 5.7.3
- **MCP SDK**: @modelcontextprotocol/sdk 1.25.2
- **Web Scraping**: cheerio 1.0.0
- **HTTP Client**: node-fetch 3.3.2

## Caching Architecture

See [CACHING.md](CACHING.md) for detailed caching architecture documentation.
