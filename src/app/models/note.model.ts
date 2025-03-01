export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  modifiedAt?: Date;
  isCheckList?: boolean;
  checkListItems?: CheckListItem[];
  color?: string;
  isPinned?: boolean;
}

export interface CheckListItem {
  id: string;
  text: string;
  checked: boolean;
  level: number;
  items?: CheckListItem[];
}