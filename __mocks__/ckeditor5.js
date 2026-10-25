// __mocks__/ckeditor5.js
// eslint-disable-next-line no-undef
export const ClassicEditor = jest.fn(() => ({
  // eslint-disable-next-line no-undef
  create: jest.fn(),
}));

// eslint-disable-next-line no-undef
export const CKEditor = jest.fn(({ onChange }) => (
  <textarea
    data-testid="rick-text-editor"
    onChange={(e) => onChange(e.target.value)}
  />
));

export const Bold = {};
export const Essentials = {};
export const Italic = {};
export const Mention = {};
export const Paragraph = {};
export const Undo = {};
export const Image = {};
export const ImageToolbar = {};
export const ImageCaption = {};
export const ImageStyle = {};
export const ImageResize = {};
export const ImageUpload = {};
export const Base64UploadAdapter = {};
export const EditorConfig = {};
export const SourceEditing = {};
export const Font = {};
export const FontSize = {};
export const FontColor = {};
export const FontBackgroundColor = {};
export const Link = {};
export const List = {};
export const BlockQuote = {};
export const Alignment = {};

// Mock CSS import
export const styles = {
  ckeditor5: {},
};
