import {Brand} from "./brand";
import {Subcategory} from "./subcategory";
import {Unittype} from "./unittype";
import {Itemstatus} from "./itemstatus";

export class Item {

  public id !: number;
  public brand!: Brand;
  public subcategory!: Subcategory;
  public name !: string;
  public code !: string;
  public unittype !: Unittype;
  public saleprice !: number;
  public purchaseprice !: number;
  public photo !: string;
  public quantity !: number;
  public rop !: number;
  public itemstatus !: Itemstatus;
  public dointroduced !: string;


  constructor(id: number, brand: Brand, subcategory: Subcategory, name: string, code: string, unittype: Unittype, saleprice: number, purchaseprice: number, photo: string, quantity: number, rop: number, itemstatus: Itemstatus, dointroduced: string) {
    this.id = id;
    this.brand = brand;
    this.subcategory = subcategory;
    this.name = name;
    this.code = code;
    this.unittype = unittype;
    this.saleprice = saleprice;
    this.purchaseprice = purchaseprice;
    this.photo = photo;
    this.quantity = quantity;
    this.rop = rop;
    this.itemstatus = itemstatus;
    this.dointroduced = dointroduced;
  }
}
