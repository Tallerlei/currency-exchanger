import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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

interface CachedData {
  data: CurrencyData;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = 'https://open.er-api.com/v6/latest';
  private cache: Map<string, CachedData> = new Map();
  private cacheExpirationMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(private http: HttpClient) { }

  getCurrencyData(baseCurrency: string): Observable<CurrencyData> {
    // Check if we have valid cached data
    const cached = this.cache.get(baseCurrency);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.cacheExpirationMs) {
      console.log(`Using cached data for ${baseCurrency}`);
      return of(cached.data);
    }

    // Fetch fresh data from API
    console.log(`Fetching fresh data for ${baseCurrency}`);
    return this.http.get<ExchangeRateApiResponse>(`${this.apiUrl}/${baseCurrency}`).pipe(
      map(response => ({
        base: response.base_code,
        date: new Date(response.time_last_update_unix * 1000).toISOString().split('T')[0],
        rates: response.rates
      })),
      tap(data => {
        // Cache the result
        this.cache.set(baseCurrency, {
          data,
          timestamp: now
        });
      })
    );
  }

  adjustCurrency(amount: number): string {
    return parseFloat(Math.round(amount * 100) / 100 + '').toFixed(2);
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Get user's currency based on their location
  async getUserCurrency(): Promise<string> {
    try {
      // Try to get user's country from IP geolocation API
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const countryCode = data.country_code;
      
      // Map country codes to currencies
      const countryCurrencyMap: { [key: string]: string } = {
        'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'JP': 'JPY', 'CN': 'CNY',
        'AU': 'AUD', 'CA': 'CAD', 'CH': 'CHF', 'IN': 'INR', 'MX': 'MXN',
        'BR': 'BRL', 'ZA': 'ZAR', 'SG': 'SGD', 'HK': 'HKD', 'SE': 'SEK',
        'NO': 'NOK', 'DK': 'DKK', 'NZ': 'NZD', 'KR': 'KRW', 'TR': 'TRY',
        'RU': 'RUB', 'PL': 'PLN', 'TH': 'THB', 'AE': 'AED', 'SA': 'SAR',
        // Add eurozone countries
        'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
        'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'GR': 'EUR', 'IE': 'EUR',
        'FI': 'EUR', 'SK': 'EUR', 'SI': 'EUR', 'LT': 'EUR', 'LV': 'EUR',
        'EE': 'EUR', 'CY': 'EUR', 'MT': 'EUR', 'LU': 'EUR'
      };
      
      return countryCurrencyMap[countryCode] || 'USD';
    } catch (error) {
      console.error('Failed to detect user location:', error);
      return 'USD'; // Default to USD if geolocation fails
    }
  }
}
