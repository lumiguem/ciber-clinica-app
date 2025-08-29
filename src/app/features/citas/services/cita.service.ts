import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CitaResponse } from '../models/cita.models';
import {environment} from '../../../../evironments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  readonly _httpClient =  inject(HttpClient);
  private readonly baseUrl= environment.apiUrl;


  getCitas(page: number = 0, size: number = 5): Observable<CitaResponse> {
    return this._httpClient.get<{ data: CitaResponse }>(`${this.baseUrl}/api/citas?page=${page}&size=${size}`)
      .pipe(map(resp => resp.data)); // saco "data"
  }
}
