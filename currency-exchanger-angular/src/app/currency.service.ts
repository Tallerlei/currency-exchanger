import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CurrencyData {
  base: string;
  date: string;
  rates: { [key: string]: number };
}

interface ExchangeRateApiResponse {
  result: string;
  base_code: string;
  rates: { [key: string]: number };
  time_last_update_unix: number;
  time_last_update_utc: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = 'https://open.er-api.com/v6/latest';

  constructor(private http: HttpClient) { }

  getCurrencyData(baseCurrency: string): Observable<CurrencyData> {
    return this.http.get<ExchangeRateApiResponse>(`${this.apiUrl}/${baseCurrency}`).pipe(
      map(response => ({
        base: response.base_code,
        date: new Date(response.time_last_update_unix * 1000).toISOString().split('T')[0],
        rates: response.rates
      }))
    );
  }

  adjustCurrency(amount: number): string {
    return parseFloat(Math.round(amount * 100) / 100 + '').toFixed(2);
  }
}
