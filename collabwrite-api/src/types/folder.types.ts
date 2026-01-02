export interface FolderDTO {
  userId: string;
  body: {
    name: string;
    color: string;
    folderId: string | null;
  }
}

export interface FolderUpdateDTO {
    body: {
        oldname: string,
        newname: string,
    }
}