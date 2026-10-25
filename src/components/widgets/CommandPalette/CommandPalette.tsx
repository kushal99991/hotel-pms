import React, { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  Box,
  TextField,
  List,
  ListItemButton,
  Typography,
  InputAdornment,
  Chip,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useCommandPalette } from "contexts/CommandPaletteContext";
import { bookingEngineMenuList } from "config/sidebarmenu.config";
import { flattenMenuItems, searchCommands } from "./commandPaletteUtils";
import { LCColors } from "theme/Colors";
import { useAppSelector } from "store/hooks";
import { RootState } from "store/store";

// Section color identities — keyed by first breadcrumb segment
const SECTION_COLORS: Record<string, string> = {
  "Front Office":       LCColors.mediumBlue,
  "Rooms":              LCColors.green,
  "Sales":              LCColors.brown,
  "Revenue Management": LCColors.purple,
  "Reports":            LCColors.darkRed,
  "Administration":     LCColors.darkBlue,
};

const DEFAULT_SECTION_COLOR = LCColors.lightBlue;

function getSectionColor(breadcrumb: string): string {
  const firstSegment = breadcrumb.split(" > ")[0].trim();
  return SECTION_COLORS[firstSegment] ?? DEFAULT_SECTION_COLOR;
}

export default function CommandPalette() {
  const { isOpen, closePalette } = useCommandPalette();
  const navigate = useNavigate();
  const roles = useAppSelector((state: RootState) => state.auth.user?.roles);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const userRoles = useMemo(
    () => roles?.map((r) => r.name) ?? [],
    [roles]
  );

  const allCommands = useMemo(
    () => flattenMenuItems(bookingEngineMenuList, [], userRoles),
    [userRoles]
  );
  const results = useMemo(() => searchCommands(allCommands, query), [allCommands, query]);

  function handleSelect(path: string) {
    navigate(path);
    closePalette();
    setQuery("");
  }

  function handleClose() {
    closePalette();
    setQuery("");
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setActiveIndex(0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = Math.min(prev + 1, results.length - 1);
        itemRefs.current[next]?.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = Math.max(prev - 1, 0);
        itemRefs.current[next]?.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "Enter") {
      const selected = results[activeIndex];
      if (selected) handleSelect(selected.path);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        onKeyDown: handleKeyDown,
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(38, 79, 115, 0.18), 0 4px 16px rgba(38, 79, 115, 0.1)",
          maxHeight: "400px",
        },
      }}
    >
      {/* Search header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `2px solid ${LCColors.offWhiteBlue}`,
          bgcolor: "#ffffff",
        }}
      >
        <SearchIcon sx={{ color: LCColors.darkBlue, fontSize: 22, flexShrink: 0 }} />
        <TextField
          autoFocus
          fullWidth
          variant="standard"
          placeholder="Search commands…"
          value={query}
          onChange={handleQueryChange}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: "1rem",
              fontWeight: 500,
              color: LCColors.darkBlue,
              "& input::placeholder": {
                color: "#9fb8c8",
                opacity: 1,
              },
            },
          }}
        />
        {query && (
          <Typography
            variant="caption"
            sx={{
              bgcolor: LCColors.offWhiteBlue,
              color: LCColors.mediumBlue,
              px: 1,
              py: 0.25,
              borderRadius: "4px",
              fontWeight: 600,
              fontSize: "0.7rem",
              flexShrink: 0,
            }}
          >
            {results.length} result{results.length !== 1 ? "s" : ""}
          </Typography>
        )}
      </Box>

      {/* Results */}
      <List
        dense
        disablePadding
        sx={{
          maxHeight: 420,
          overflowY: "auto",
          bgcolor: "#ffffff",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: LCColors.paleBlue,
            borderRadius: "2px",
          },
        }}
      >
        {results.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#9fb8c8", fontStyle: "italic" }}>
              No commands found
            </Typography>
          </Box>
        ) : (
          results.map((cmd, index) => (
            <CommandResultItem
              key={cmd.id}
              title={cmd.title}
              breadcrumb={cmd.breadcrumb}
              icon={cmd.icon}
              isActive={index === activeIndex}
              ref={(el) => { itemRefs.current[index] = el; }}
              onSelect={() => handleSelect(cmd.path)}
              onMouseEnter={() => setActiveIndex(index)}
            />
          ))
        )}
      </List>

      {/* Footer */}
      <Box
        sx={{
          borderTop: `2px solid ${LCColors.offWhiteBlue}`,
          px: 2.5,
          py: 1,
          display: "flex",
          gap: 2,
          bgcolor: LCColors.offWhiteBlue,
        }}
      >
        {[["↑↓", "navigate"], ["↵", "select"], ["esc", "close"]].map(([key, label]) => (
          <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              component="span"
              sx={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "#ffffff",
                bgcolor: LCColors.mediumBlue,
                px: 0.75,
                py: 0.2,
                borderRadius: "4px",
                lineHeight: 1.6,
                letterSpacing: "0.02em",
              }}
            >
              {key}
            </Typography>
            <Typography variant="caption" sx={{ color: LCColors.mediumBlue, fontSize: "0.7rem" }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}

interface CommandResultItemProps {
  title: string;
  breadcrumb: string;
  icon?: React.ElementType;
  isActive: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

const CommandResultItem = React.forwardRef<HTMLDivElement, CommandResultItemProps>(
  function CommandResultItem({ title, breadcrumb, icon: Icon, isActive, onSelect, onMouseEnter }, ref) {
    const sectionColor = getSectionColor(breadcrumb);

    return (
      <ListItemButton
        ref={ref}
        onClick={onSelect}
        onMouseEnter={onMouseEnter}
        disableRipple
        sx={{
          px: 2,
          py: 1.25,
          gap: 1.5,
          alignItems: "center",
          borderLeft: `3px solid transparent`,
          transition: "background-color 80ms ease, border-color 80ms ease",
          ...(isActive
            ? {
                bgcolor: LCColors.darkBlue,
                borderLeftColor: LCColors.lightBlue,
                "&:hover": { bgcolor: LCColors.darkBlue },
              }
            : {
                bgcolor: "transparent",
                "&:hover": { bgcolor: LCColors.offWhiteBlue, borderLeftColor: sectionColor + "60" },
              }),
        }}
      >
        {/* Icon bubble */}
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            bgcolor: isActive ? "rgba(255,255,255,0.15)" : sectionColor + "18",
          }}
        >
          {Icon ? (
            <Icon
              sx={{
                fontSize: 16,
                color: isActive ? "#ffffff" : sectionColor,
              }}
            />
          ) : (
            // Fallback dot when no icon
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: isActive ? "#ffffff" : sectionColor,
              }}
            />
          )}
        </Box>

        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              color: isActive ? "#ffffff" : LCColors.darkBlue,
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
          {breadcrumb && (
            <Box sx={{ mt: 0.4 }}>
              <Chip
                label={breadcrumb}
                size="small"
                sx={{
                  height: 16,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  bgcolor: isActive ? "rgba(255,255,255,0.18)" : sectionColor + "20",
                  color: isActive ? "rgba(255,255,255,0.85)" : sectionColor,
                  borderRadius: "4px",
                  "& .MuiChip-label": { px: 0.75 },
                  border: "none",
                }}
              />
            </Box>
          )}
        </Box>
      </ListItemButton>
    );
  }
);
