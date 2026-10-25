import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material";
import { RouteList } from "config/sidebarmenu.config";
import { commandPaletteOverrides } from "./commandPaletteOverrides";

export interface PaletteCommand {
  id: string;
  title: string;
  path: string;
  breadcrumb: string;
  icon?: OverridableComponent<SvgIconTypeMap<object, "svg">>;
}

export function flattenMenuItems(
  items: RouteList[],
  parentSegments: string[] = [],
  userRoles?: string[],
  seenPaths: Set<string> = new Set()
): PaletteCommand[] {
  const result: PaletteCommand[] = [];

  for (const item of items) {
    const hasAccess =
      !userRoles ||
      !item.roles ||
      item.roles.some((r) => userRoles.includes(r));

    if (!hasAccess) continue;

    const isNavigable =
      item.path &&
      typeof item.path === "string" &&
      !item.path.startsWith("#") &&
      !item.path.includes(":");

    if (isNavigable) {
      const path = item.path as string;
      if (!seenPaths.has(path)) {
        seenPaths.add(path);
        result.push({
          id: path,
          title: commandPaletteOverrides[path] ?? item.menuTitle,
          path,
          breadcrumb: parentSegments.join(" > "),
          icon: item.icon,
        });
      }
    }

    if (item.subMenu?.length) {
      const nextSegments = item.menuTitle ? [...parentSegments, item.menuTitle] : parentSegments;
      result.push(...flattenMenuItems(item.subMenu, nextSegments, userRoles, seenPaths));
    }
  }

  return result;
}

export function scoreCommand(command: PaletteCommand, query: string): number {
  const q = query.toLowerCase();
  const title = command.title.toLowerCase();
  const breadcrumb = command.breadcrumb.toLowerCase();
  let score = 0;

  if (title.includes(q)) {
    score += 100;
  }

  if (breadcrumb.includes(q)) {
    score += 40;
  }

  const queryWords = q.split(/\s+/).filter(Boolean);
  const titleWords = title.split(/\s+/);
  for (const qWord of queryWords) {
    if (titleWords.some((tw) => tw.startsWith(qWord))) {
      score += 30;
    }
  }

  // Scatter match: all query chars appear in order in title
  let charIndex = 0;
  for (const char of title) {
    if (char === q[charIndex]) {
      charIndex++;
    }
  }
  if (charIndex === q.length) {
    score += Math.round(50 * (q.length / title.length));
  }

  return score;
}

export function searchCommands(commands: PaletteCommand[], query: string): PaletteCommand[] {
  const q = query.trim();
  if (!q) return commands;

  return commands
    .map((cmd) => ({ cmd, score: scoreCommand(cmd, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ cmd }) => cmd);
}
