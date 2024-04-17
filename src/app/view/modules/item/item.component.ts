import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Item} from "../../../entity/item";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {ItemService} from "../../../service/itemservice";
import {Itemstatus} from "../../../entity/itemstatus";
import {Category} from "../../../entity/category";
import {Itemstatusservice} from "../../../service/itemstatusservice";
import {Categoryservice} from "../../../service/categoryservice";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";

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
  public ssearch!: FormGroup;

  item: Array<Item> = [];
  data!: MatTableDataSource<Item>;
  imageurl: string= '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  itemstatuses :Array<Itemstatus> = [];
  categories :Array<Category> = [];

  uiassist: UiAssist;

  constructor(
    private fb: FormBuilder ,
    private  is: ItemService,
    private iss: Itemstatusservice,
    private cs: Categoryservice,
    private dg: MatDialog,
  ) {
    this.uiassist = new UiAssist(this);

    this.cssearch =  this.fb.group({
      'csname': new FormControl(),
      'cscode': new FormControl(),
      'csunittype': new FormControl(),
      'csprice': new FormControl(),
      'cspprice': new FormControl(),
      'csmodi': new FormControl(),
    });

    this.ssearch = this.fb.group({
      'ssname': new FormControl(),
      'ssitemstatus': new FormControl(),
      'sscategory': new FormControl(),
    });
  }

  ngOnInit() {
    this.initialize();
  }


  private initialize() {
    this.createView();

    this.iss.getAllList().then((itemstatus: Itemstatus[]):void =>{
        this.itemstatuses = itemstatus;
        console.log(itemstatus)
    })

    this.cs.getAllList().then((cat:Category[]): void=>{
      this.categories =  cat;
      console.log(cat)
    })

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

  btnSearchMc():void{
    const ssearchdata = this.ssearch.getRawValue();

    let name = ssearchdata.ssname;
    let category = ssearchdata.sscategory;
    let itemstatusid = ssearchdata.ssitemstatus;

    let   query:string = '';

    if (name != null && name.trim() != "") query = query + "&itemname=" + name;
    if (category != null ) query = query + "&categoryid=" + category;
    if (itemstatusid != null ) query = query + "&itemstatusid" + itemstatusid;
    if(query != '') query = query.replace(/^./, "?");

    this.loadTable(query);
  }

  btnSearchClearMc(){

    const confirm: MatDialogRef<ConfirmComponent>  = this.dg.open(ConfirmComponent,
      {width: '500px', data: { heading: "Search Clear", message: "Are you sure you want to clear the search."}
      })
    confirm.afterClosed().subscribe(async result=>{
      if(result){
        this.ssearch.reset();
        this.loadTable('');
      }
    })

  }


}
