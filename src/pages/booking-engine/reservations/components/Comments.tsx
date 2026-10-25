import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  TextField,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { ICommentResponse } from "types/reservationTypes";
import {
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "services/reservationSlice";
import useAuth from "hooks/useAuth";
import useSnackbar from "hooks/useSnackbar";
import { convertUtcToTimezone } from "utils/helperFunctions/common";

interface CommentsProps {
  comments: ICommentResponse[];
  reservationId: number | null;
  onRefresh?: () => void;
}

const Comments: React.FC<CommentsProps> = ({
  comments = [],
  reservationId,
  onRefresh,
}) => {
  const { users, currentTimeZone } = useAuth();
  const { openSnackbar } = useSnackbar();

  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [addComment] = useAddCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const handleAddComment = () => {
    onAddComment(newComment);
    setNewComment("");
  };

  const handleUpdateComment = async () => {
    if (editingCommentId !== null) {
      const response = await updateComment({
        id: editingCommentId,
        comment: editingCommentText,
      });
      if (response.error) {
        openSnackbar(response.error as string, "error");
        return false;
      }
      onRefresh?.();
      setEditingCommentId(null);
      setEditingCommentText("");
      openSnackbar("Your comments has been updated successfully!", "success");
    }
  };

  const onAddComment = async (comment: string) => {
    const response = await addComment({
      reservation_id: reservationId ?? 0,
      comment,
      property_id: users?.defaultPropertyId ?? 0,
    });
    if (response.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }
    onRefresh?.();
  };

  const handleDeleteComment = async (commentId: number) => {
    const response = await deleteComment({ id: commentId });
    if (response.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }
    onRefresh?.();
    openSnackbar("Your comments has been deleted successfully!", "success");
  };

  // reverse sort so latest comment shows first
  const sortedComments = [...comments].sort(
    (commA: ICommentResponse, commB: ICommentResponse) => {
      const momentA = convertUtcToTimezone(commA.created_at, currentTimeZone);
      const momentB = convertUtcToTimezone(commB.created_at, currentTimeZone);
      if (momentB.isBefore(momentA)) {
        return -1;
      } else if (momentA.isBefore(momentB)) {
        return 1;
      }
      return 0;
    }
  );

  const visibleComments = showAllComments
    ? sortedComments
    : sortedComments.slice(0, 2);

  return (
    <Box display="flex" flexDirection="column">
      <Box sx={{ maxHeight: "320px", overflowY: "auto" }}>
        <Box p={2}>
          {comments.length === 0 ? (
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              p={2}
            >
              No comments for this reservation.
            </Typography>
          ) : (
            visibleComments.map((comment, index) => (
              <Box
                key={comment.id}
                display="flex"
                alignItems="center"
                marginBottom={index === visibleComments.length - 1 ? 0 : 2}
                borderBottom={
                  index === visibleComments.length - 1
                    ? "0px solid #e0e0e0"
                    : "1px solid #e0e0e0"
                }
                paddingBottom={index === visibleComments.length - 1 ? 0 : 2}
              >
                <Avatar
                  alt={
                    comment.user?.first_name || comment.user?.last_name
                      ? `${comment.user?.first_name ?? ""} ${comment.user?.last_name ?? ""}`.trim()
                      : "Unknown Author"
                  }
                  src={comment.user?.profile_image ?? ""}
                  sx={{ width: 40, height: 40, marginRight: 2 }}
                >
                  <Typography variant="h6" color="white" fontSize="11px">
                    {comment.user?.first_name || comment.user?.last_name
                      ? `${comment.user?.first_name?.charAt(0).toUpperCase() ?? ""} ${comment.user?.last_name?.charAt(0).toUpperCase() ?? ""}`.toUpperCase()
                      : "U A"}
                  </Typography>
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  {editingCommentId === comment.id ? (
                    <Box display="flex" flexDirection="column" gap={1}>
                      <TextField
                        fullWidth
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                      />
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleUpdateComment}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setEditingCommentId(null)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body1" fontWeight="bold">
                        {comment.user?.first_name || comment.user?.last_name
                          ? `${comment.user?.first_name ?? ""} ${comment.user?.last_name ?? ""}`.trim()
                          : "Unknown Author"}
                      </Typography>
                      <Typography variant="body2" marginY={1}>
                        {comment.comment}
                      </Typography>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {convertUtcToTimezone(
                            comment.created_at,
                            currentTimeZone
                          ).format("MMM DD, YYYY hh:mm A")}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {users?.id === comment.user?.id && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditingCommentText(comment.comment);
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            ))
          )}
        </Box>

        {comments.length > 0 && comments.length > 2 && (
          <Box
            display="flex"
            alignItems="center"
            borderTop={1}
            borderColor="#e0e0e0"
            marginTop={2}
          >
            {comments.length > 2 && !showAllComments ? (
              <>
                <Button
                  variant="text"
                  onClick={() => setShowAllComments(true)}
                  sx={{ textAlign: "center", width: "100%" }}
                >
                  Show More Comments
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  onClick={() => setShowAllComments(false)}
                  sx={{ textAlign: "center", width: "100%" }}
                >
                  Hide More Comments
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: 2,
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <TextField
          fullWidth
          placeholder="Write a comment..."
          value={newComment}
          multiline
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddComment}
          disabled={!newComment.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Comments;
