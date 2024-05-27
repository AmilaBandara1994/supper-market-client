import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Item} from "../entity/item";
import {Employee} from "../entity/employee";

@Injectable({
  providedIn: 'root'
})

export class ItemService {

  constructor(private http: HttpClient) {  }




  async getAll(query:string): Promise<Array<Item>> {
    const items = await this.http.get<Array<Item>>('http://localhost:8080/items'+query).toPromise();
    if(items == undefined){
      return [];
    }
    return items;
  }

  async add(item: Item): Promise<[]|undefined>{
    return this.http.post<[]>('http://localhost:8080/items', item).toPromise();
  }


}


