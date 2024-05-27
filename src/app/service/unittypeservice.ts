import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Item} from "../entity/item";
import {Unittype} from "../entity/unittype";

@Injectable({
  providedIn: 'root'
})

export class Unittypeservice {

  constructor(private http: HttpClient) {  }




  async getAll(query:string): Promise<Array<Unittype>> {
    const unittypes = await this.http.get<Array<Unittype>>('http://localhost:8080/unittypes/list'+query).toPromise();
    if(unittypes == undefined){
      return [];
    }
    return unittypes;
  }


}


