import {Brand} from "./brand";
import {Category} from "./category";

export class Empstatus {

  public id !: number;
  public brand !: Brand;
  public category !: Category;


  constructor(id: number, brand: Brand, category: Category) {
    this.id = id;
    this.brand = brand;
    this.category = category;
  }
}
