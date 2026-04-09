import { Injectable } from '@nestjs/common';
import fs from 'fs-extra';

@Injectable()
export class FileService {
  async copy(source: string, destination: string): Promise<void> {
    await fs.copy(source, destination);
  }

  async delete(source: string): Promise<void> {
    await fs.remove(source);
  }

  async readDirectory(path: string): Promise<string[]> {
    return await fs.readdir(path);
  }
}
