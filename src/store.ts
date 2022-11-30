import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const resolutions = ["640x480", "1280x720", "1920x1080"] as const;
export type Resolution = typeof resolutions[number];

export enum Orient {
  X = -1,
  Y = 1,
}

export enum ColorMode {
  light = "light",
  dark = "dark",
}

export type ConfigType = {
  framterate: number;
  resolution: Resolution;
  x_duty: number;
  y_duty: number;
};

export const colorModeAtom = atomWithStorage<ColorMode>("darkMode", ColorMode.dark);
export const configAtom = atom<ConfigType>({
  framterate: 0,
  resolution: "640x480",
  x_duty: 50,
  y_duty: 50,
});
export const editAtom = atom(false);
export const editingAtom = atom(false);
