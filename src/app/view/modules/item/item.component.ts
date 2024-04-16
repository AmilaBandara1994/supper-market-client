import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Item} from "../../../entity/item";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {ItemService} from "../../../service/itemservice";

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent {

  columns: string[] = ['name', 'code', 'unittype', 'sprice' ,'pprice', 'modi'];
  headers: string[] = ['Name', 'Code', 'Unit Type', 'Sale Price', 'Purchase Price', 'Modification'];
  binders: string[] = ['name', 'code', 'unittype.name', 'sprice', 'pprice', 'getModi()'];

  cscolumns: string[] = ['csname', 'cscode', 'csunittype', 'csprice', 'cspprice', 'csmodi'];
  csprompts: string[] = ['Search by Name', 'Search by Code', 'Search by Unit Type',
    'Search by Sale Price', 'Search by Purchase Price', 'Search by Modi'];

  public cssearch!: FormGroup;

  item: Array<Item> = [];
  data!: MatTableDataSource<Item>;
  imageurl: string= '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  uiassist: UiAssist;

  constructor(private fb: FormBuilder , private  is: ItemService ) {
    this.uiassist = new UiAssist(this);

    this.cssearch =  this.fb.group({
      'csname': new FormControl(),
      'cscode': new FormControl(),
      'csunittype': new FormControl(),
      'csprice': new FormControl(),
      'cspprice': new FormControl(),
      'csmodi': new FormControl(),
    });
  }

  ngOnInit() {
    this.initialize();
  }


  private initialize() {
    this.createView();
  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  loadTable(query: string) {

    this.is.getAll(query)
      .then((item: Item[]) => {
        this.item = item;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.item);
        this.data.paginator = this.paginator;
      });

  }

  getModi(element: Item) {
    return element.name + '(' + element.code + ')';
  }

  filterTable(): void{
    const cssearchdata = this.cssearch.getRawValue();

    this.data.filterPredicate = ((item: Item, filter:string)=>{
      return (cssearchdata.csname == null || item.name.includes(cssearchdata.csname)) &&
        (cssearchdata.cscode == null || item.code.includes(cssearchdata.cscode)) &&
          (cssearchdata.csunittype == null || item.unittype.name.includes(cssearchdata.csunittype)) &&
          (cssearchdata.csprice == null || item.saleprice.toString().includes(cssearchdata.csprice)) &&
          (cssearchdata.cspprice == null || item.purchaseprice.toString().includes(cssearchdata.cspprice))&&
          (cssearchdata.csmodi == null || this.getModi(item).toLowerCase().includes(cssearchdata.csmodi) );
    });

    this.data.filter="yys";
  }

}
