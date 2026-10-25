import { Box, Typography } from "@mui/material";
import { StatusInfo } from "types/metricsTypes";

interface StatusCountSectionProps {
  title: string;
  stats: Record<string, number>;
  statusInfo: StatusInfo[];
  excludeCode?: string;
}

function StatusCountSection({
  title,
  stats,
  statusInfo,
  excludeCode,
}: StatusCountSectionProps) {
  const entries = statusInfo?.filter(
    (info) => !excludeCode || info.name === excludeCode
  );

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Typography
          sx={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "text.primary",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
      </Box>

      <Box
        mt={2}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
          gap: 0,
        }}
      >
        {entries?.map((info) => {
          const count = stats[info.name] ?? 0;
          const codeColor = count > 0 ? info.color_code : "text.disabled";

          return (
            <Box
              key={info.name}
              sx={{
                textAlign: "center",
                px: 1.5,
                py: 0.5,
                borderRight: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderRight: "none" },
              }}
            >
              <Typography
                sx={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                  color: count > 0 ? "text.primary" : "text.disabled",
                }}
              >
                {count}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: codeColor,
                  lineHeight: 1.3,
                  mt: 0.25,
                }}
              >
                {info.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  color: "text.disabled",
                  lineHeight: 1.2,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  letterSpacing: "0.02em",
                }}
              >
                {info.full_name}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default StatusCountSection;
