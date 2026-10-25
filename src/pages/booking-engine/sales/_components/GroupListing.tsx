import {
  Box,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import Modal from "components/widgets/ModalWindows/Modal";
import React, { useCallback, useState } from "react";
import { useSalesAccountGroupListQuery } from "services/salesSlice";
import { ISalesAccountGroup } from "types/salesTypes";
import AddNewSalesGroup from "./AddNewSalesGroup";
import { useParams } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GroupIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";

const GroupListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editGroup, setEditGroup] = useState<ISalesAccountGroup | null>(null);
  const {
    data: accountGroupList,
    isLoading,
    refetch,
  } = useSalesAccountGroupListQuery({
    id: id ?? "",
  });

  const handleDialogClose = useCallback(() => {
    setIsOpen(false);
    setEditGroup(null);
  }, []);

  const handleEditClick = (group: ISalesAccountGroup) => {
    setEditGroup(group);
    setIsOpen(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ marginTop: 2 }} data-testid="group-listing-skeleton-loading">
        <Grid container spacing={2}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Skeleton variant="rectangular" width="100%" height={30} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="80%" height={40} />
                  <Skeleton variant="text" width="80%" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width="100%" height={30} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const CustomCardTitle = ({
    title,
    icon,
    rightContent,
  }: {
    title: string;
    icon?: React.ReactNode;
    rightContent?: React.ReactNode;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {icon ?? ""}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      {rightContent && <Box>{rightContent}</Box>}
    </Box>
  );

  return (
    <Box sx={{ mb: 3 }}>
      {/* Group Names Section */}
      <Card>
        <CardContent>
          <CustomCardTitle
            title="Linking Group"
            icon={<GroupIcon />}
            rightContent={
              <IconButton onClick={() => setIsOpen(true)}>
                <AddCircleOutlineIcon data-testid="add-circle-outline-icon" />
              </IconButton>
            }
          />
          <Divider />

          <Box sx={{ marginTop: 2 }}>
            <Grid container spacing={2}>
              {accountGroupList && accountGroupList.length > 0 ? (
                accountGroupList.map((group: ISalesAccountGroup, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent>
                        <CustomCardTitle
                          title={group.group_name}
                          rightContent={
                            <Box display="flex" alignItems="center">
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ marginRight: 1 }}
                              >
                                <Box
                                  component="span"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Status:
                                </Box>{" "}
                                {group.group_status}
                              </Typography>
                              <IconButton
                                onClick={() => handleEditClick(group)}
                              >
                                <EditIcon data-testid="edit-icon" />
                              </IconButton>
                            </Box>
                          }
                        />
                        <Divider />
                        <Box mt={2}>
                          <Typography variant="body2" color="text.secondary">
                            <Box component="span" sx={{ fontWeight: "bold" }}>
                              Group Code:
                            </Box>{" "}
                            {group.group_code}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Box component="span" sx={{ fontWeight: "bold" }}>
                              Group Type:
                            </Box>{" "}
                            {group.group_type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Box component="span" sx={{ fontWeight: "bold" }}>
                              Description:
                            </Box>{" "}
                            {group.group_description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Box component="span" sx={{ fontWeight: "bold" }}>
                              Arrival Date:
                            </Box>{" "}
                            {new Date(
                              group.group_arrival_date
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Box component="span" sx={{ fontWeight: "bold" }}>
                              Departure Date:
                            </Box>{" "}
                            {new Date(
                              group.group_departure_date
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Box component="span" sx={{ fontWeight: "bold" }}>
                              Release Date:
                            </Box>{" "}
                            {new Date(
                              group.group_release_date
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Box component="span" sx={{ fontWeight: "bold" }}>
                              Cutoff Date:
                            </Box>{" "}
                            {new Date(
                              group.group_cutoff_date
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Box component="span" sx={{ fontWeight: "bold" }}>
                              Attributes:
                            </Box>{" "}
                            {(group?.group_attributes ?? []).join(", ")}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Typography variant="body2" color="text.secondary">
                          #{group.id}
                        </Typography>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Typography variant="body2" sx={{ padding: 2 }}>
                  No related groups found.
                </Typography>
              )}
            </Grid>

            <Modal
              open={isOpen}
              title={editGroup ? "Edit Group" : "Add New Group"}
              size="sm"
              onClose={handleDialogClose}
              isHideCloseButton={true}
            >
              <AddNewSalesGroup
                salesAccountId={Number(id)}
                onClose={handleDialogClose}
                onRefresh={() => refetch()}
                editGroup={editGroup}
              />
            </Modal>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GroupListing;
