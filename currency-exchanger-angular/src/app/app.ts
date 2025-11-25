import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from './currency.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  amount: number = 0;
  fromCurrency: string = 'EUR';
  toCurrency: string = 'GBP';
  result: string = '0.00';
  rate: number = 0;

  currencies = [
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'USD', symbol: '$' }
  ];

  constructor(private currencyService: CurrencyService) {}

  ngOnInit() {
    this.getCurrencyData();
  }

  getCurrencyData() {
    this.currencyService.getCurrencyData(this.fromCurrency).subscribe({
      next: (data) => {
        if (data.rates[this.toCurrency]) {
          this.rate = data.rates[this.toCurrency];
          this.convertMoney();
        } else {
          this.rate = 1;
          this.convertMoney();
        }
      },
      error: (error) => {
        alert('Something went wrong.');
        console.error(error);
      }
    });
  }

  convertMoney() {
    const converted = this.amount * this.rate;
    this.result = this.currencyService.adjustCurrency(converted);
  }

  currencyChanged() {
    this.getCurrencyData();
  }

  swapCurrency(event: Event) {
    event.preventDefault();
    const tempCurrency = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = tempCurrency;
    this.getCurrencyData();
  }
}
