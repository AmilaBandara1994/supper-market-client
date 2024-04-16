import {Category} from "./category";

export class Subcategory {

  public id !: number;
  public name !: string;
  public category !: Category;


  constructor(id: number, name: string, category: Category) {
    this.id = id;
    this.name = name;
    this.category = category;
  }
}
