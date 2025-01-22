import { Injectable, Scope } from '@nestjs/common';
import { google } from 'googleapis';
import { GaxiosResponse } from 'gaxios';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3';
import { JWT } from 'google-auth-library';
import { Readable } from 'stream';
import { MainUploadFileResponse, PublicsUrlsResponse } from './drive.type';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { v6 } from 'uuid';

/**
 * DriveService class provides methods for interacting with Google Drive API.
 * @class DriveService
 * @exports DriveService
 * @description This class provides methods for uploading, downloading, and managing files in Google Drive.
 * @Warning Try to use main... methods instead of the others. The others are for internal use but can be used if necessary.
 * @Requires googleapis, google-auth-library, stream, fs, and other utility functions.
 * @Requires A service account key file (apiDrive.json) and environment variables.
 * @public
 * @version 1.1
 * @since 1.0
 * @example new DriveService()
 * @example DriveService.mainUploadFile(fileUpload, fileName)
 * @example DriveService.mainListFiles()
 * @example DriveService.mainDeleteFile(fileId)
 * @example DriveService.mainDownloadFile(fileId)
 * @example DriveService.mainDownloadFiles(fileIds)
 *
 */
@Injectable({ scope: Scope.DEFAULT })
export class DriveService {
  // KEYS = JSON.parse(fs.readFileSync(join(__dirname, 'apiDrive.json'), 'utf8'));
  KEYS = JSON.parse(this.configService.getOrThrow('DRIVE_KEYS'));
  SCOPES = ['https://www.googleapis.com/auth/drive'];
  PARENTFOLDER = this.configService.getOrThrow('DRIVE_PARENT_FOLDER_ID');
  OWNER_EMAIL = this.configService.getOrThrow('DRIVE_OWNER_EMAIL');

  constructor(private readonly configService: ConfigService) {
    this.PARENTFOLDER = this.configService.getOrThrow('DRIVE_PARENT_FOLDER_ID');
    this.OWNER_EMAIL = this.configService.getOrThrow('DRIVE_OWNER_EMAIL');
    this.KEYS = JSON.parse(this.configService.getOrThrow('DRIVE_KEYS'));
  }

  /**
   * Uploads a file and returns the necessary information.
   *
   * @param fileUpload - The file to be uploaded.
   * @param fileName - The name of the file.
   * @param parentFolder - (Optional) The ID of the parent folder where the file should be uploaded.
   * @returns A promise that resolves to an object containing the fileId, webViewLink, webContentLink, previewLink, folderIdYear, folderIdMonth, folderMonthLink, and folderYearLink.
   *
   */
  async mainUploadFile(
    fileUpload: Express.Multer.File,
    fileName: string,
    parentFolder?: string,
  ): Promise<MainUploadFileResponse> {
    const authClient = await this.authorize();
    const folderIdYear = await this.searchFolderOrCreate(
      authClient,
      new Date().getFullYear().toString(),
      parentFolder,
    );
    const folderIdMonth = await this.searchFolderOrCreate(
      authClient,
      new Date().toLocaleString('default', { month: 'long' }),
      folderIdYear,
    );
    const fileId = await this.uploadFile(
      authClient,
      fileUpload,
      fileName,
      folderIdMonth,
    );
    const { webViewLink, webContentLink } = await this.generatePublicsUrls(
      authClient,
      fileId,
    );
    const previewLink = this.getPreviewLink(fileId);
    const folderMonthLink = this.getFolderLink(folderIdMonth);
    const folderYearLink = this.getFolderLink(folderIdYear);

    return {
      fileId,
      webViewLink,
      webContentLink,
      previewLink,
      folderIdYear,
      folderIdMonth,
      folderMonthLink,
      folderYearLink,
    };
  }

  /**
   * Retrieves a list of files from the Google Drive API.
   *
   * @returns A promise that resolves to an array of drive_v3.Schema$File objects.
   *
   */
  async mainListFiles(): Promise<drive_v3.Schema$File[]> {
    const authClient = await this.authorize();
    return this.listFiles(authClient);
  }

  /**
   * Deletes a file with the specified fileId.
   *
   * @param fileId - The ID of the file to be deleted.
   * @returns A promise that resolves when the file is successfully deleted.
   *
   */
  async mainDeleteFile(fileId: string): Promise<void> {
    const authClient = await this.authorize();
    await this.deleteFile(authClient, fileId);
  }

  /**
   * Downloads a file from Google Drive using the provided file ID.
   *
   * @param fileId - The ID of the file to be downloaded.
   * @returns A promise that resolves to the downloaded file as an Express.Multer.File object.
   */
  async mainDownloadFile(fileId: string): Promise<Express.Multer.File> {
    const authClient = await this.authorize();
    return this.downloadFileFromBuffer(authClient, fileId);
  }

  /**
   * Downloads multiple files from a remote source using their file IDs.
   *
   * @param fileIds - An array of file IDs to be downloaded.
   * @returns A promise that resolves to an array of downloaded files.
   */
  async mainDownloadFiles(fileIds: string[]): Promise<Express.Multer.File[]> {
    const authClient = await this.authorize();
    const files: Express.Multer.File[] = [];
    for (const fileId of fileIds) {
      const file = await this.downloadFileFromBuffer(authClient, fileId);
      files.push(file);
    }
    return files;
  }

  /**
   * Authorizes the client to access the Google Drive API.
   *
   * @returns A promise that resolves to the authorized client.
   *
   */
  async authorize(): Promise<JWT> {
    const client = new google.auth.JWT(
      this.KEYS.client_email,
      null,
      this.KEYS.private_key,
      this.SCOPES,
    );
    await client.authorize();
    return client;
  }

  /**
   * Uploads a file to Google Drive.
   *
   * @param authClient - The authenticated client for accessing Google Drive.
   * @param fileUpload - The file to be uploaded.
   * @param fileName - The name of the file.
   * @param folderId - (Optional) The ID of the folder where the file should be uploaded.
   * @returns A promise that resolves with the ID of the uploaded file.
   *
   */
  async uploadFile(
    authClient: JWT,
    fileUpload: Express.Multer.File,
    fileName: string,
    folderId?: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: authClient });
      const fileMetadata: drive_v3.Schema$File = {
        name: fileName,
        parents: folderId ? [folderId] : [this.PARENTFOLDER],
      };
      const readableStream = Readable.from(fileUpload.buffer);
      const media = {
        mimeType: fileUpload.mimetype,
        body: readableStream,
      };
      drive.files.create(
        {
          requestBody: fileMetadata,
          media: media,
          fields: 'id',
        },
        (
          err: Error | null,
          file?: GaxiosResponse<drive_v3.Schema$File> | null,
        ) => {
          if (err) {
            reject(err);
          } else {
            resolve(file.data.id);
          }
        },
      );
    });
  }

  /**
   * Generates a public URL for a file in Google Drive.
   *
   * @param authClient - The JWT authentication client.
   * @param fileId - The ID of the file in Google Drive.
   * @returns A promise that resolves to an object containing the generated public URLs.
   *
   */
  async generatePublicsUrls(
    authClient: JWT,
    fileId: string,
  ): Promise<PublicsUrlsResponse> {
    return new Promise<PublicsUrlsResponse>((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: authClient });
      drive.permissions.create(
        {
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        },
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            drive.files.get(
              {
                fileId: fileId,
                fields: 'webViewLink, webContentLink',
              },
              (
                err: Error | null,
                file: GaxiosResponse<drive_v3.Schema$File>,
              ) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    webViewLink: file.data.webViewLink,
                    webContentLink: file.data.webContentLink,
                  });
                }
              },
            );
          }
        },
      );
    });
  }

  /**
   * Deletes a file from Google Drive.
   *
   * @param authClient The GoogleAuth instance used for authentication.
   * @param fileId The ID of the file to be deleted.
   * @returns A Promise that resolves when the file is successfully deleted, or rejects with an error if deletion fails.
   *
   */
  async deleteFile(authClient: JWT, fileId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: authClient });
      drive.files.delete({ fileId: fileId }, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Retrieves a list of files from Google Drive.
   *
   * @param authClient - The authenticated GoogleAuth client.
   * @returns A promise that resolves to an array of drive_v3.Schema$File objects representing the files.
   * @throws If there is an error retrieving the files.
   *
   */
  async listFiles(authClient: JWT): Promise<drive_v3.Schema$File[]> {
    return new Promise<drive_v3.Schema$File[]>((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: authClient });
      drive.files.list(
        {
          // pageSize: 10, // Commented out to retrieve all files, but not trully necessary or prooved
          fields:
            'files(id, name, mimeType, webViewLink, fileExtension, createdTime)',
          orderBy: 'folder, createdTime desc',
        },
        (err: Error | null, res: GaxiosResponse<drive_v3.Schema$FileList>) => {
          if (err) {
            reject(err);
          } else {
            resolve(res.data.files);
          }
        },
      );
    });
  }

  /**
   * Downloads a file from Google Drive and returns it as a buffer.
   *
   * @param authClient - The GoogleAuth client for authentication.
   * @param fileId - The ID of the file to download.
   * @returns A Promise that resolves to an Express.Multer.File object representing the downloaded file.
   *
   */
  async downloadFileFromBuffer(
    authClient: JWT,
    fileId: string,
  ): Promise<Express.Multer.File> {
    const drive: drive_v3.Drive = google.drive({
      version: 'v3',
      auth: authClient,
    });
    const fileMetadata: GaxiosResponse<drive_v3.Schema$File> =
      await drive.files.get({ fileId: fileId });
    const driveFile: GaxiosResponse<drive_v3.Schema$File> =
      await drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'arraybuffer' },
      );
    const buffer = Buffer.from(driveFile.data as ArrayBuffer);
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: fileMetadata.data.name,
      encoding: '7bit',
      mimetype: fileMetadata.data.mimeType,
      size: buffer.length,
      buffer: buffer,
      stream: Readable.from(buffer),
      destination: '',
      filename: fileMetadata.data.name,
      path: '',
    };
    return file;
  }

  /**
   * Searches for a folder with the specified name in Google Drive. If the folder does not exist, creates a new folder.
   *
   * @param authClient - The GoogleAuth client for authentication.
   * @param folderName - The name of the folder to search for or create.
   * @param parent - (Optional) The ID of the parent folder where the new folder should be created.
   * @returns A Promise that resolves to the ID of the folder.
   *
   */
  async searchFolderOrCreate(
    authClient: JWT,
    folderName: string,
    parent?: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: authClient });
      const query = parent
        ? `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parent}' in parents`
        : `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`;
      drive.files.list(
        {
          q: query,
          fields: 'files(id, name)',
        },
        (err: Error | null, res: GaxiosResponse<drive_v3.Schema$FileList>) => {
          if (err) {
            reject(err);
          } else {
            if (res.data.files.length) {
              resolve(res.data.files[0].id);
            } else {
              const fileMetadata: drive_v3.Schema$File = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: parent ? [parent] : [this.PARENTFOLDER],
              };
              drive.files.create(
                {
                  requestBody: fileMetadata,
                  fields: 'id',
                },
                async (
                  err: Error | null,
                  file: GaxiosResponse<drive_v3.Schema$File>,
                ) => {
                  if (err) {
                    reject(err);
                  } else {
                    await this.shareFolder(authClient, file.data.id);
                    await this.giveWritePermissionFolder(
                      authClient,
                      file.data.id,
                      this.OWNER_EMAIL,
                    );
                    resolve(file.data.id);
                  }
                },
              );
            }
          }
        },
      );
    });
  }

  /**
   * Shares a folder with read-only access to anyone.
   *
   * @param authClient - The JWT authentication client.
   * @param folderId - The ID of the folder to be shared.
   * @returns A promise that resolves when the folder is successfully shared, or rejects with an error if there was an issue.
   *
   */
  async shareFolder(authClient: JWT, folderId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: authClient });
      drive.permissions.create(
        {
          fileId: folderId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        },
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  /**
   * Gives write permission to a user for a specific folder in Google Drive.
   *
   * @param authClient - The JWT authentication client.
   * @param folderId - The ID of the folder in Google Drive.
   * @param email - The email address of the user to grant write permission.
   * @returns A Promise that resolves when the write permission is granted, or rejects with an error.
   *
   */
  async giveWritePermissionFolder(
    authClient: JWT,
    folderId: string,
    email: string,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: authClient });
      drive.permissions.create(
        {
          fileId: folderId,
          requestBody: {
            role: 'writer',
            type: 'user',
            emailAddress: email,
          },
        },
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  /**
   * Changes the ownership of a file in Google Drive.
   *
   * @param authClient - The authenticated GoogleAuth client.
   * @param fileId - The ID of the file to change ownership.
   * @param ownerEmail - The email address of the new owner.
   * @returns A Promise that resolves to the updated permission object.
   *
   * @deprecated This function is currently experimental and may not be stable. Use with caution.
   * @warning This function may change or be removed in future updates. It is not recommended for production use.
   * @error This function is not working as expected because can only transfer ownership to a user in the same domain and the domain is
   * sapp-project-433021.iam.gserviceaccount.com not cecytem.edu.mx
   *
   */
  async changeOwnership(
    authClient: JWT,
    fileId: string,
    ownerEmail: string,
  ): Promise<drive_v3.Schema$Permission> {
    return new Promise<drive_v3.Schema$Permission>((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: authClient });
      drive.permissions.create(
        {
          fileId: fileId,
          requestBody: {
            role: 'owner',
            type: 'user',
            emailAddress: ownerEmail,
          },
          transferOwnership: true,
        },
        (
          err: Error | null,
          res: GaxiosResponse<drive_v3.Schema$Permission>,
        ) => {
          if (err) {
            reject(err);
          } else {
            resolve(res.data);
          }
        },
      );
    });
  }

  /**
   * Downloads a file from Google Drive.
   *
   * @param authClient - The JWT authentication client.
   * @param fileId - The ID of the file to download.
   * @param path - The path where the downloaded file will be saved.
   * @returns A promise that resolves when the file is successfully downloaded, or rejects with an error.
   *
   * @warning This function is currently experimental and may not be stable. Use with caution.
   * @warning This function may change or be removed in future updates. It is not recommended for production use.
   * @warning It only works for pdf files.
   *
   */
  async downloadFile(
    authClient: JWT,
    fileId: string,
    path: string,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth: authClient });
      const dest = fs.createWriteStream(`${path}/${v6()}.pdf`, {
        flags: 'w',
      });
      drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' },
        (err, res) => {
          if (err) {
            reject(err);
          }
          res.data
            .on('end', () => {
              resolve();
            })
            .on('error', (err) => {
              reject(err);
            })
            .pipe(dest);
        },
      );
    });
  }

  /**
   * Generates a preview link for a pdf file in Google Drive.
   *
   * @param fileId - The ID of the file.
   * @returns The preview link for the file.
   *
   */
  getPreviewLink(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /**
   * Returns the Google Drive folder link based on the provided folder ID.
   *
   * @param folderId - The ID of the folder.
   * @returns The Google Drive folder link.
   *
   */
  getFolderLink(folderId: string): string {
    return `https://drive.google.com/drive/folders/${folderId}`;
  }

  /**
   * Returns the Google Drive file link based on the provided file ID.
   *
   * @param fileId - The ID of the file.
   * @returns The Google Drive file link.
   *
   */
  getFileLink(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}`;
  }
}
