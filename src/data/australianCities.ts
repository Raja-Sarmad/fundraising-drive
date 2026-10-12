export type CityGroup = {
  state: string;
  cities: string[];
};

export const australianCities: CityGroup[] = [
  {
    state: "New South Wales",
    cities: ["Sydney", "Newcastle"],
  },
  {
    state: "Victoria",
    cities: ["Melbourne"],
  },
  {
    state: "Queensland",
    cities: ["Brisbane"],
  },
  {
    state: "Western Australia",
    cities: ["Perth"],
  },
  {
    state: "South Australia",
    cities: ["Adelaide"],
  },
];
