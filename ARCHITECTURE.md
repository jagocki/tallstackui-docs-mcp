# TallStackUI Documentation MCP Server Architecture

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
│                   TallStackUI MCP Server                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    MCP Tools                                │ │
│  │                                                             │ │
│  │  • search_docs      - Search documentation                 │ │
│  │  • list_components  - List all components                  │ │
│  │  • get_component    - Get component docs                   │ │
│  │  • get_page        - Get any doc page                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Data Processing Layer                          │ │
│  │                                                             │ │
│  │  • Web Scraping (cheerio)                                  │ │
│  │  • HTML Parsing & Content Extraction                       │ │
│  │  • Search & Filtering                                      │ │
│  │  • Error Handling                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ HTTPS
                        │
┌───────────────────────▼─────────────────────────────────────────┐
│                   https://tallstackui.com/docs/v2/              │
│                                                                  │
│  • Getting Started                                              │
│  • UI Components (26)                                           │
│  • Form Components (16)                                         │
│  • Interaction Components (2)                                   │
│  • Other Resources (3)                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Component Categories

### Getting Started (4)
- documentation
- installation
- configuration
- starter-kit

### UI Components (26)
alert, avatar, badge, banner, boolean, button, card, carousel, clipboard, dropdown, environment, icon, layout, link, loading, modal, progress, rating, signature, slide, stats, step, tab, table, toast, tooltip

### Form Components (16)
checkbox, color, currency, date, input, number, password, pin, radio, range, select, tag, textarea, time, toggle, upload

### Interaction Components (2)
dialog, reaction

### Other (3)
theme, helpers, upgrade-guide

## Configuration

Environment Variables:
- `TALLSTACKUI_DOCS_URL`: Base URL (default: https://tallstackui.com/docs/v2)
- `MAX_CONTENT_SIZE`: Max content size (default: 15000 characters)

## Technology Stack

- **Runtime**: Node.js >= 20.18.1
- **Language**: TypeScript 5.7.3
- **MCP SDK**: @modelcontextprotocol/sdk 1.25.3
- **Web Scraping**: cheerio 1.0.0
- **HTTP Client**: node-fetch 3.3.2
