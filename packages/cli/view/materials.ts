import chalk, { Chalk } from "chalk";
import { Material, MaterialMap } from "@dhu/core";

export const renderMaterialMap = (data: MaterialMap) => {
  console.log(JSON.stringify(data, null, 4));
};
