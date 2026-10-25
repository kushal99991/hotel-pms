import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { ITaxTypes } from "types/financialSettingTypes";

interface ITaxDetailModalProps {
  taxToUpdate: ITaxTypes | null;
}

const TaxDetailModal: React.FC<ITaxDetailModalProps> = ({ taxToUpdate }) => {
  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" fontSize={16}>
            Tax Type
          </Typography>
          <Typography variant="body2" fontSize={14}>
            {taxToUpdate?.type}
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" fontSize={16}>
            Posting Code
          </Typography>
          <Typography variant="body2" fontSize={14}>
            {`${taxToUpdate?.posting_code?.name} (${taxToUpdate?.posting_code?.code})`}
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" mt={2} fontSize={16}>
        Description
      </Typography>
      <Typography variant="body2" fontSize={14}>
        {taxToUpdate?.description}
      </Typography>

      <Typography variant="h6" mt={2}>
        Tax Versions
      </Typography>

      {/* Tax Versions Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Rate</strong>
              </TableCell>
              <TableCell>
                <strong>Start Date</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taxToUpdate?.versions?.length ? (
              taxToUpdate?.versions?.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    {taxToUpdate?.type === "PERCENTAGE"
                      ? `${version.rate}%`
                      : `$${version.rate}`}
                  </TableCell>
                  <TableCell>
                    {new Date(version.starts_from).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography variant="body2">
                    No tax versions available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" mt={2}>
        Attach Department
      </Typography>

      {taxToUpdate?.posting_code_departments?.length ? (
        taxToUpdate?.posting_code_departments?.map((department) => (
          <Card
            key={department.posting_code_department.id}
            sx={{
              mb: 2,
              border: "1px solid #ddd",
              borderRadius: "10px",
            }}
          >
            <CardHeader
              title={department.posting_code_department.name}
              sx={{
                backgroundColor: "#32A1AE",
                color: "#fff",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                padding: "10px",
              }}
              titleTypographyProps={{
                fontSize: "18px",
              }}
            />
            <CardContent sx={{ padding: "5px", marginTop: 2 }}>
              {/* Included Posting Codes */}
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Included:
                </Typography>
                {department.inc_posting_codes.length > 0 ? (
                  <List
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      padding: 0,
                    }}
                  >
                    {department.inc_posting_codes.map((postingCode) => (
                      <ListItem
                        key={postingCode.id}
                        sx={{
                          paddingY: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: "auto" }}>
                          <CircleIcon sx={{ fontSize: 12 }} color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${postingCode.name} (${postingCode.code})`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <ListItem
                    key={0}
                    sx={{
                      width: {
                        xs: "100%",
                      },
                      paddingY: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      No included posting codes
                    </Typography>
                  </ListItem>
                )}
              </Box>

              {/* Excluded Posting Codes */}
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Excluded:
                </Typography>
                {department.exc_posting_codes.length > 0 ? (
                  <List
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      padding: 0,
                    }}
                  >
                    {department.exc_posting_codes.map((postingCode) => (
                      <ListItem
                        key={postingCode.id}
                        sx={{
                          paddingY: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: "auto" }}>
                          <CircleIcon sx={{ fontSize: 12 }} color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${postingCode.name} (${postingCode.code})`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <ListItem
                    key={0}
                    sx={{
                      width: {
                        xs: "100%",
                      },
                      paddingY: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      No excluded posting codes
                    </Typography>
                  </ListItem>
                )}
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body2" color="textSecondary">
          No departments attached
        </Typography>
      )}
    </Box>
  );
};

export default TaxDetailModal;
