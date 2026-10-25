import React, { useEffect, useState, useCallback } from "react";
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
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
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
  PluginConstructor,
  Editor,
} from "ckeditor5";
import { Box, Skeleton } from "@mui/material";
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
  allowImageUpload?: boolean; // Added prop to control image upload feature
}

const RichTextEditor: React.FC<RickTextEditorProps> = ({
  initialData = "",
  onChange,
  config,
  isInvalid,
  helperText,
  initialLoading = false,
  minHeight = 100,
  allowImageUpload = true, // Default is true now
}) => {
  const { data: mentionItems, isLoading: tagsLoading } =
    useGetEmailTemplateTagListQuery();

  const [editorConfig, setEditorConfig] = useState<EditorConfig | null>(null);
  const [loading, setLoading] = useState(initialLoading || tagsLoading);

  // Update the editor configuration once the mention items are loaded
  useEffect(() => {
    if (!tagsLoading && mentionItems) {
      const toolbarItems = [
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
        "insertTable", // Add table options here
      ];

      const plugins: Array<PluginConstructor<Editor> | string> = [
        Essentials,
        Bold,
        Italic,
        Paragraph,
        Undo,
        Mention,
        Font,
        FontSize,
        FontColor,
        FontBackgroundColor,
        Link,
        List,
        BlockQuote,
        Alignment,
        SourceEditing,
        Table,
        TableToolbar,
        TableProperties,
        TableCellProperties,
      ];

      // Conditionally add image-related features if allowImageUpload is true
      if (allowImageUpload) {
        toolbarItems.push("imageUpload", "imageStyle:side");
        plugins.push(
          Image,
          ImageToolbar,
          ImageCaption,
          ImageStyle,
          ImageResize,
          ImageUpload,
          Base64UploadAdapter
        );
      }

      setEditorConfig({
        toolbar: {
          items: toolbarItems,
        },
        plugins: plugins,
        mention: {
          feeds: [
            {
              marker: '"',
              feed: mentionItems.map((tag) => `"${tag.name}`),
            },
          ],
        },
        image: allowImageUpload
          ? {
              toolbar: [
                "imageTextAlternative",
                "imageStyle:inline",
                "imageStyle:block",
                "imageStyle:side",
                "resizeImage",
              ],
            }
          : undefined,
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
        table: {
          contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"], // Add table toolbar options
        },
        ...config,
      });

      // Stop loading once data and config are ready
      setLoading(false);
    }
  }, [tagsLoading, mentionItems, config, allowImageUpload]);

  const handleEditorChange = useCallback(
    (event: EventInfo, editor: ClassicEditor) => {
      const data = editor.getData();
      onChange?.(data);
    },
    [onChange]
  );

  return (
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
  );
};

export default RichTextEditor;
