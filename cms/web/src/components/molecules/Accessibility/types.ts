export type PublicScope = "private" | "public"; // Add "limited" when functionality becomes available

export type Model = {
  id: string;
  name?: string;
  public: boolean;
  key?: string;
};
