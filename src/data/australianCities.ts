export type CityGroup = {
  state: string;
  cities: string[];
};

export const australianCities: CityGroup[] = [
  {
    state: "Western Australia",
    cities: ["Perth"],
  },
  {
    state: "South Australia",
    cities: ["Adelaide"],
  },
];
