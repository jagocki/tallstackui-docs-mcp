#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { mkdir, readFile, writeFile, stat } from "fs/promises";
import { join } from "path";

const BASE_URL = process.env.TALLSTACKUI_DOCS_URL || "https://tallstackui.com/docs/v2";
const MAX_CONTENT_SIZE = parseInt(process.env.MAX_CONTENT_SIZE || "15000", 10);
const CACHE_DIR = process.env.CACHE_DIR || ".cache";
const CACHE_TTL = parseInt(process.env.CACHE_TTL || "3600", 10) * 1000; // Default 1 hour in milliseconds

interface DocumentationPage {
  title: string;
  url: string;
  content: string;
}

interface CachedPage extends DocumentationPage {
  cachedAt: number;
}

/**
 * Generate a cache key from a path
 */
function getCacheKey(path: string): string {
  return createHash("md5").update(path).digest("hex");
}

/**
 * Get cached page if it exists and is not expired
 */
async function getCachedPage(path: string): Promise<DocumentationPage | null> {
  try {
    const cacheKey = getCacheKey(path);
    const cachePath = join(CACHE_DIR, `${cacheKey}.json`);
    
    const fileStats = await stat(cachePath);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - fileStats.mtimeMs > CACHE_TTL) {
      return null;
    }
    
    const cached = await readFile(cachePath, "utf-8");
    const cachedPage: CachedPage = JSON.parse(cached);
    
    // Return without cachedAt field
    const { cachedAt, ...page } = cachedPage;
    return page;
  } catch (error) {
    // Cache miss or error reading cache
    return null;
  }
}

/**
 * Save page to cache
 */
async function cachePage(path: string, page: DocumentationPage): Promise<void> {
  try {
    // Ensure cache directory exists
    await mkdir(CACHE_DIR, { recursive: true });
    
    const cacheKey = getCacheKey(path);
    const cachePath = join(CACHE_DIR, `${cacheKey}.json`);
    
    const cachedPage: CachedPage = {
      ...page,
      cachedAt: Date.now(),
    };
    
    await writeFile(cachePath, JSON.stringify(cachedPage, null, 2), "utf-8");
  } catch (error) {
    // Silently fail cache writes - not critical
    console.error("Failed to cache page:", error);
  }
}

// Known documentation sections and components
// Based on TallStackUI v2 GitHub repository and documentation site
const KNOWN_SECTIONS = {
  "getting-started": ["documentation", "installation", "configuration", "starter-kit"],
  "ui": [
    "alert",
    "avatar",
    "badge",
    "banner",
    "boolean",
    "button",
    "card",
    "carousel",
    "clipboard",
    "dropdown",
    "environment",
    "icon",
    "layout",
    "link",
    "loading",
    "modal",
    "progress",
    "rating",
    "signature",
    "slide",
    "stats",
    "step",
    "tab",
    "table",
    "toast",
    "tooltip",
  ],
  "form": [
    "checkbox",
    "color",
    "currency",
    "date",
    "input",
    "number",
    "password",
    "pin",
    "radio",
    "range",
    "select",
    "tag",
    "textarea",
    "time",
    "toggle",
    "upload",
  ],
  "interaction": ["dialog", "reaction"],
  "other": ["theme", "helpers", "upgrade-guide"],
};

/**
 * Fetch and parse a documentation page (with caching)
 */
async function fetchDocPage(path: string): Promise<DocumentationPage> {
  // Try to get from cache first
  const cached = await getCachedPage(path);
  if (cached) {
    return cached;
  }

  // Cache miss - fetch from web
  const url = `${BASE_URL}/${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract title
  const title =
    $("h1").first().text().trim() ||
    $("title").text().replace(" - TallStackUI", "").trim();

  // Extract main content
  // Remove navigation, header, footer, and scripts
  $("nav, header, footer, script, style").remove();

  // Get the main content area
  const mainContent =
    $("main").text() || $("article").text() || $("body").text();

  // Clean up whitespace
  const content = mainContent
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  const page: DocumentationPage = {
    title,
    url,
    content: content.substring(0, MAX_CONTENT_SIZE), // Limit content size to avoid large responses
  };

  // Cache the page for future requests
  await cachePage(path, page);

  return page;
}

/**
 * Search documentation by keyword
 */
async function searchDocs(query: string): Promise<string[]> {
  const results: string[] = [];
  const searchQuery = query.toLowerCase();

  // Search through all known sections and components
  for (const [section, pages] of Object.entries(KNOWN_SECTIONS)) {
    for (const page of pages) {
      if (
        page.toLowerCase().includes(searchQuery) ||
        section.toLowerCase().includes(searchQuery)
      ) {
        results.push(`${section}/${page}`);
      }
    }
  }

  return results;
}

/**
 * List all available components
 */
function listComponents(): Record<string, string[]> {
  return KNOWN_SECTIONS;
}

// Create server instance
const server = new Server(
  {
    name: "tallstackui-docs-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools: Tool[] = [
  {
    name: "search_docs",
    description:
      "Search TallStackUI documentation for components or topics. Returns a list of matching documentation pages.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (component name, topic, or keyword)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_page",
    description:
      "Get the content of a specific TallStackUI documentation page. Provide the path like 'ui/button' or 'form/input'.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            "Documentation page path (e.g., 'ui/button', 'form/input', 'documentation')",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "list_components",
    description:
      "List all available TallStackUI components organized by category (UI, Form, Interaction, etc.).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_component",
    description:
      "Get documentation for a specific TallStackUI component. Automatically determines if it's a UI or Form component.",
    inputSchema: {
      type: "object",
      properties: {
        component: {
          type: "string",
          description:
            "Component name (e.g., 'button', 'input', 'modal', 'select')",
        },
      },
      required: ["component"],
    },
  },
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!args) {
      throw new Error("Missing arguments");
    }

    switch (name) {
      case "search_docs": {
        const query = args.query as string;
        const results = await searchDocs(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  query,
                  results,
                  message:
                    results.length > 0
                      ? `Found ${results.length} matching pages`
                      : "No results found. Try a different search term.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_components": {
        const components = listComponents();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  categories: components,
                  total: Object.values(components).flat().length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_page": {
        const path = args.path as string;
        const page = await fetchDocPage(path);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(page, null, 2),
            },
          ],
        };
      }

      case "get_component": {
        const component = args.component as string;
        let path = "";

        // Try to find the component in known sections
        for (const [section, pages] of Object.entries(KNOWN_SECTIONS)) {
          if (pages.includes(component.toLowerCase())) {
            path = `${section}/${component.toLowerCase()}`;
            break;
          }
        }

        if (!path) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    error: `Component '${component}' not found. Use list_components to see available components.`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const page = await fetchDocPage(path);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(page, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Unknown tool" }, null, 2),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: error instanceof Error ? error.message : String(error),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TallStackUI Documentation MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
