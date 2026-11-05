export type PicoMessage = {
  id: string;
  role: "user" | "pico";
  text: string;
};
