import { File as MulterFile } from 'multer';

declare global {
  namespace Express {
    interface Request {
      file?: MulterFile; // Add the file property to the Request interface
      files?: MulterFile[]; // If you want to support multiple files
    }
  }
}
