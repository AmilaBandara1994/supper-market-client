import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
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
import {Subcategoryservice} from "../../../service/subcategoryservice";
import {Unittypeservice} from "../../../service/unittypeservice";
import {Brandservice} from "../../../service/brandservice";
import {Subcategory} from "../../../entity/subcategory";
import {Brand} from "../../../entity/brand";
import {Unittype} from "../../../entity/unittype";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {from, last} from "rxjs";

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
  public form!: FormGroup;

  item!: Item;
  items: Array<Item> = [];
  data!: MatTableDataSource<Item>;
  imageurl: string= '';
  imageitemurl: string= 'assets/supermarket-back.png';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  itemstatuses :Array<Itemstatus> = [];
  categories :Array<Category> = [];
  subcategories :Array<Subcategory> = [];
  brands :Array<Brand> = [];
  unittypes :Array<Unittype> = [];

  lastitemcode!:string;

  regexes!:any;

  uiassist: UiAssist;
  mindate:Date = new Date();
  private enaadd!: boolean;
  private enaupd!: boolean;
  private enadel!: boolean;

  constructor(
    private fb: FormBuilder ,
    private  is: ItemService,
    private iss: Itemstatusservice,
    private cs: Categoryservice,
    private scs: Subcategoryservice,
    private uts: Unittypeservice,
    private bs: Brandservice,
    private rgs: RegexService,
    private dg: MatDialog,
    private dp: DatePipe,
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


    this.form = this.fb.group({
      "category": new FormControl('', [Validators.required]),
      "brand": new FormControl('', [Validators.required]),
      "subcategory": new FormControl('', [Validators.required]),
      "name": new FormControl('', [Validators.required]),
      "code": new FormControl('', [Validators.required]),
      "photo": new FormControl('', [Validators.required]),
      "pprice": new FormControl('', [Validators.required]),
      "sprice": new FormControl('', [Validators.required]),
      "quantity": new FormControl('', [Validators.required]),
      "rop": new FormControl('', [Validators.required]),
      "dointroduced": new FormControl({value:new Date(), disabled: true}, [Validators.required]),
      "unittype": new FormControl('', [Validators.required]),
      "itemstatus": new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    this.initialize();
  }


  private initialize() {
    this.createView();

    this.iss.getAllList().then((itemstatus: Itemstatus[]):void =>{
        this.itemstatuses = itemstatus;
    })

    this.cs.getAllList().then((cat:Category[]): void=>{
      this.categories =  cat;
    })

    this.uts.getAll('').then((unittype:Unittype[]): void=>{
      this.unittypes =  unittype;
    })

    this.rgs.get('items').then((regs: []) => {
      this.regexes = regs;
      this.createForm();
    });



  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  loadTable(query: string) {

    this.is.getAll(query)
      .then((item: Item[]) => {
        this.items = item;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.items);
        this.data.paginator = this.paginator;
        this.getLastItemCode();
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
    // console.log('server search  name ', name);
    // console.log('server search  category  ', category);
    // console.log('server search  isumstatus ', itemstatusid);

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

  createForm() {

    this.form.controls['category'].setValidators([Validators.required]);
    this.form.controls['brand'].setValidators([Validators.required]);
    this.form.controls['subcategory'].setValidators([Validators.required]);
    this.form.controls['name'].setValidators([Validators.required, Validators.pattern(this.regexes['name']['regex'])]);
    this.form.controls['code'].setValidators([Validators.required, Validators.pattern(this.regexes['code']['regex'])]);
    this.form.controls['photo'].setValidators([Validators.required]);
    this.form.controls['pprice'].setValidators([Validators.required, Validators.pattern(this.regexes['pprice']['regex'])]);
    this.form.controls['sprice'].setValidators([Validators.required, Validators.pattern(this.regexes['sprice']['regex'])]);
    this.form.controls['quantity'].setValidators([Validators.required, Validators.pattern(this.regexes['quantity']['regex'])]);
    this.form.controls['rop'].setValidators([Validators.required,Validators.pattern(this.regexes['rop']['regex'])]);
    this.form.controls['dointroduced'].setValidators([Validators.required,Validators.pattern(this.regexes['dointroduced']['regex'])]);
    this.form.controls['unittype'].setValidators([Validators.required]);
    this.form.controls['itemstatus'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach( control => { control.markAsTouched(); } );

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore
          if (controlName == "dointroduced" )
            value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

          // if (this.oldemployee != undefined && control.valid) {
          //   // @ts-ignore
          //   if (value === this.employee[controlName]) {
          //     control.markAsPristine();
          //   } else {
          //     control.markAsDirty();
          //   }
          // } else {
          //   control.markAsPristine();
          // }
        }
      );

    }

    this.filterSubCategory();
    this.filterBrands();
    this.generateItemName();

    this.enableButtons(true,false,false);

  }

  enableButtons(add:boolean, upd:boolean, del:boolean){
    this.enaadd=add;
    this.enaupd=upd;
    this.enadel=del;
  }

  filterSubCategory():void {
    this.form.get('category')?.valueChanges.subscribe((cat:Category)=>{
      let query='';
      if(cat !=null)  query = "?categoryid="+ cat.id;
      this.scs.getAllList(query).then((sct:Subcategory[])=>{
        this.subcategories =sct;
      })
    })
  }

  filterBrands():void {
    this.form.get('category')?.valueChanges.subscribe((bnd:Brand)=>{
      let query = '';
      if(bnd !=null) query = "?categoryid="+ bnd.id;
      this.bs.getAllList(query).then((bnds:Brand[])=>{
        this.brands = bnds;
      })
    })
  }

  generateItemName(){

    this.form.get('brand')?.valueChanges.subscribe((bnd:Brand) =>{
      let itemname =''
      let subcategory  = this.form.get("subcategory")?.value;
      itemname = bnd.name + " " + subcategory.name;
      this.form.get('name')?.setValue(itemname);
    })
  }


  add() {

    let errors = this.getErros();

    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Item Add ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {

      this.item = this.form.getRawValue();
      this.item.photo = btoa(this.imageitemurl);
      // @ts-ignore
      this.item.dointroduced = this.dp.transform(this.item.dointroduced, "YYYY-MM-dd")

      let itemData: string = "";

      itemData = itemData + "<br>Item Name is : " + this.item.name;
      itemData = itemData + "<br>Code  is : " + this.item.code;
      itemData = itemData + "<br> Brand  is : " + this.item.brand;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: "Confirmation - Item Add",
          message: "Are you sure to Add the following Item ? <br> <br>" + itemData
        }
      });

      let addstatus: boolean = false;
      let addmessage: string = "Server Not Found";

      confirm.afterClosed().subscribe(async result => {
        if (result) {
          this.is.add(this.item).then((responce: [] | undefined) => {
            if (responce != undefined) { // @ts-ignore
              console.log("Add-" + responce['id'] + "-" + responce['url'] + "-" + (responce['errors'] == ""));
              // @ts-ignore
              addstatus = responce['errors'] == "";
              if (!addstatus) { // @ts-ignore
                addmessage = responce['errors'];
              }
            } else {
              addstatus = false;
              addmessage = "Content Not Found"
            }
          }).finally(() => {

            if (addstatus) {
              addmessage = "Successfully Saved";
              this.form.reset();
              this.clearImage();
              Object.values(this.form.controls).forEach(control => {
                control.markAsTouched();
              });
              this.loadTable("");
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Item Add", message: addmessage}
            });

            stsmsg.afterClosed().subscribe(async result => {
              if (!result) {
                return;
              }
            });
          });
        }
      });
    }
  }


  clear() {

  }

  update() {

  }

  delete() {

  }

  selectImage(e: any): void {
    console.log(e);
    if (e.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event: any) => {
        this.imageitemurl = event.target.result;
        this.form.controls['photo'].clearValidators();
      }
    }
  }

  clearImage(): void {
    this.imageitemurl = 'assets/supermarket-back.png';
    this.form.controls['photo'].setErrors({'required': true});
  }

  getErros(){
    let erros ='';
    for(const controllName in this.form.controls){
      const control = this.form.controls[controllName];
      if(control.errors){
        if(this.regexes[controllName] != undefined){
          erros = erros+"<br />" + this.regexes[controllName]['message'];
        }else {
          erros = erros + "<br/> Invalid " + controllName;
        }
      }
    }
    console.log(erros);
    return erros;
  }
  getLastItemCode(){
    let observableItem =  from(this.items);
    observableItem.pipe(last()).subscribe((item:Item)=>{
      this.lastitemcode =item.code;
    });
  }
}
