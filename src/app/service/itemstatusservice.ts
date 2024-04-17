import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Itemstatus} from "../entity/itemstatus";

@Injectable({
  providedIn: 'root'
})

export class Itemstatusservice {

  constructor(private http: HttpClient) {  }

  async getAllList(): Promise<Array<Itemstatus>> {

    const itemstatuses = await this.http.get<Array<Itemstatus>>('http://localhost:8080/itemstatuses/list').toPromise();
    if(itemstatuses == undefined){
      return [];
    }
    return itemstatuses;
  }

}


