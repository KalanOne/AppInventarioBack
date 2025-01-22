export type { MainUploadFileResponse, PublicsUrlsResponse };

interface MainUploadFileResponse {
  fileId: string;
  webViewLink: string;
  webContentLink: string;
  previewLink: string;
  folderIdYear: string;
  folderIdMonth: string;
  folderMonthLink: string;
  folderYearLink: string;
}

interface PublicsUrlsResponse {
  webViewLink: string;
  webContentLink: string;
}
