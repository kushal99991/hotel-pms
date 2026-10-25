import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Mention,
  Paragraph,
  Undo,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  ImageUpload,
  Base64UploadAdapter,
  EditorConfig,
  SourceEditing,
  Font,
  FontSize,
  FontColor,
  FontBackgroundColor,
  Link,
  List,
  BlockQuote,
  Alignment,
  EventInfo,
} from "ckeditor5";
import {
  Box,
  Skeleton,
  Button,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
} from "@mui/material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import "ckeditor5/ckeditor5.css";
import { useGetEmailTemplateTagListQuery } from "services/emailTemplateSlice";

interface RickTextEditorProps {
  initialData?: string;
  isInvalid?: boolean;
  initialLoading?: boolean;
  helperText?: string;
  onChange?: (data: string) => void;
  config?: object;
  minHeight?: number;
}

const RichTextEditor: React.FC<RickTextEditorProps> = ({
  initialData = "",
  onChange,
  config,
  isInvalid,
  helperText,
  initialLoading = false,
  minHeight = 100,
}) => {
  const { data: mentionItems, isLoading: tagsLoading } =
    useGetEmailTemplateTagListQuery();

  const [editorConfig, setEditorConfig] = useState<EditorConfig | null>(null);
  const [loading, setLoading] = useState(initialLoading || tagsLoading);
  const [editor, setEditor] = useState<ClassicEditor | null>(null);

  // For the tag dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleTagButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleTagMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTagSelect = (tag: string) => {
    if (editor) {
      const viewFragment = editor.data.processor.toView(`${tag}`);
      const modelFragment = editor.data.toModel(viewFragment);
      editor.model.insertContent(modelFragment);
    }
    setAnchorEl(null);
  };

  // Update the editor configuration once the mention items are loaded
  useEffect(() => {
    if (!tagsLoading && mentionItems) {
      setEditorConfig({
        toolbar: {
          items: [
            "sourceEditing",
            "bold",
            "italic",
            "link",
            "fontFamily",
            "fontSize",
            "fontColor",
            "fontBackgroundColor",
            "alignment",
            "bulletedList",
            "numberedList",
            "blockQuote",
            "undo",
            "redo",
            "imageUpload",
            "imageStyle:full",
            "imageStyle:side",
          ],
        },
        plugins: [
          Essentials,
          Bold,
          Italic,
          Paragraph,
          Undo,
          Mention,
          Image,
          ImageToolbar,
          ImageCaption,
          ImageStyle,
          ImageResize,
          ImageUpload,
          Base64UploadAdapter,
          SourceEditing,
          Font,
          FontSize,
          FontColor,
          FontBackgroundColor,
          Link,
          List,
          BlockQuote,
          Alignment,
        ],
        mention: {
          feeds: [
            {
              marker: '"',
              feed: mentionItems.map((tag) => ({
                id: `"${tag.name}"`,
                text: `${tag.name}`,
              })),
            },
          ],
        },
        image: {
          toolbar: [
            "imageTextAlternative",
            "imageStyle:inline",
            "imageStyle:block",
            "imageStyle:side",
            "resizeImage",
          ],
        },
        fontSize: {
          options: ["tiny", "small", "default", "big", "huge"],
        },
        fontFamily: {
          options: [
            "default",
            "Arial, Helvetica, sans-serif",
            "Courier New, Courier, monospace",
            "Georgia, serif",
            "Lucida Sans Unicode, Lucida Grande, sans-serif",
            "Tahoma, Geneva, sans-serif",
            "Times New Roman, Times, serif",
            "Trebuchet MS, Helvetica, sans-serif",
            "Verdana, Geneva, sans-serif",
          ],
        },
        ...config,
      });

      // Stop loading once data and config are ready
      setLoading(false);
    }
  }, [tagsLoading, mentionItems, config]);

  const handleEditorChange = useCallback(
    (event: EventInfo, editor: ClassicEditor) => {
      const data = editor.getData();
      onChange?.(data);
    },
    [onChange]
  );

  const handleEditorReady = (editor: ClassicEditor) => {
    setEditor(editor);
  };

  return (
    <Box component="div">
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Tooltip title="Insert email template tag" placement="top">
          <Button
            variant="outlined"
            size="small"
            ref={buttonRef}
            onClick={handleTagButtonClick}
            disabled={loading || !mentionItems?.length}
            sx={{ textTransform: "none" }}
          >
            Insert Tag
          </Button>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleTagMenuClose}
          MenuListProps={{
            "aria-labelledby": "tag-button",
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem disabled>
            <Typography variant="caption" color="textSecondary">
              Select a tag to insert
            </Typography>
          </MenuItem>
          {mentionItems?.map((tag) => (
            <MenuItem key={tag.id} onClick={() => handleTagSelect(tag.name)}>
              {tag.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Box component="div" minHeight={minHeight}>
        {loading ? (
          <Skeleton variant="rectangular" height={minHeight} />
        ) : (
          editorConfig && (
            <CKEditor
              key={JSON.stringify(editorConfig)}
              editor={ClassicEditor}
              data={initialData}
              onChange={handleEditorChange}
              onReady={handleEditorReady}
              config={editorConfig}
              data-testid="rick-text-editor"
            />
          )
        )}

        {isInvalid && helperText && (
          <Box component="div" color="error.main">
            {helperText}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RichTextEditor;
