export type ColorConfig = {
  defaultColor: string;
  colorOptions: ColorOption[];
};

export interface ColorOption {
  id: string;
  value: string;
  name: string;
}
