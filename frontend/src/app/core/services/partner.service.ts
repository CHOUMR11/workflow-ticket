import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partner } from '../models/partner.model';

const API = 'http://192.168.100.112:5000/api/partners';

@Injectable({ providedIn: 'root' })
export class PartnerService {
  constructor(private http: HttpClient) {}

  getPartners(type?: 'client' | 'fournisseur'): Observable<Partner[]> {
    const url = type ? `${API}?type=${type}` : API;
    return this.http.get<Partner[]>(url);
  }

  createPartner(payload: Partial<Partner>): Observable<Partner> {
    return this.http.post<Partner>(API, payload);
  }

  updatePartner(id: string, payload: Partial<Partner>): Observable<Partner> {
    return this.http.patch<Partner>(`${API}/${id}`, payload);
  }
}
