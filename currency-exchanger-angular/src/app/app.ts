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
  amount: number = 1;
  resultAmount: number = 0;
  fromCurrency: string = 'USD';
  toCurrency: string = 'EUR';
  result: string = '0.00';
  rate: number = 0;
  isConvertingFromSource: boolean = true;
  
  // Money printer feature
  isPrinting: boolean = false;
  printingMessage: string = '';
  moneyEmojis: Array<{emoji: string, left: string, animationDelay: string}> = [];
  brrrrText: string = '';

  currencies = [
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
  ];

  constructor(private currencyService: CurrencyService) {}

  ngOnInit() {
    this.loadFromLocalStorage();
    this.detectUserLocation();
  }

  loadFromLocalStorage() {
    const savedFromCurrency = localStorage.getItem('fromCurrency');
    const savedToCurrency = localStorage.getItem('toCurrency');
    
    if (savedFromCurrency && this.currencies.find(c => c.code === savedFromCurrency)) {
      this.fromCurrency = savedFromCurrency;
    }
    
    if (savedToCurrency && this.currencies.find(c => c.code === savedToCurrency)) {
      this.toCurrency = savedToCurrency;
    }
    
    // Ensure they're different
    if (this.fromCurrency === this.toCurrency) {
      this.toCurrency = this.fromCurrency === 'USD' ? 'EUR' : 'USD';
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('fromCurrency', this.fromCurrency);
    localStorage.setItem('toCurrency', this.toCurrency);
  }

  async detectUserLocation() {
    try {
      const userCurrency = await this.currencyService.getUserCurrency();
      // Only set if not loaded from localStorage
      if (!localStorage.getItem('fromCurrency')) {
        this.fromCurrency = userCurrency;
        // Make sure toCurrency is different
        if (this.toCurrency === userCurrency) {
          // Set to one of the major currencies
          const majorCurrencies = ['USD', 'EUR', 'GBP'];
          const differentCurrency = majorCurrencies.find(c => c !== userCurrency) || 'USD';
          this.toCurrency = differentCurrency;
        }
      }
      this.getCurrencyData();
    } catch (error) {
      // If detection fails, use defaults
      this.getCurrencyData();
    }
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
    if (this.isConvertingFromSource) {
      const converted = this.amount * this.rate;
      this.resultAmount = Math.round(converted * 100) / 100;
      this.result = this.currencyService.adjustCurrency(converted);
    } else {
      const converted = this.resultAmount / this.rate;
      this.amount = Math.round(converted * 100) / 100;
    }
  }

  onAmountChange() {
    this.isConvertingFromSource = true;
    this.convertMoney();
  }

  onResultChange() {
    this.isConvertingFromSource = false;
    this.convertMoney();
  }

  onAmountFocus() {
    if (this.amount === 0) {
      this.amount = 1;
      this.isConvertingFromSource = true;
      this.convertMoney();
    }
  }

  onResultFocus() {
    if (this.resultAmount === 0) {
      this.resultAmount = 1;
      this.isConvertingFromSource = false;
      this.convertMoney();
    }
  }

  onFromCurrencyChange() {
    // If user selects the same currency as target, swap them
    if (this.fromCurrency === this.toCurrency) {
      const differentCurrency = this.currencies.find(c => c.code !== this.fromCurrency);
      if (differentCurrency) {
        this.toCurrency = differentCurrency.code;
      }
    }
    this.saveToLocalStorage();
    this.getCurrencyData();
  }

  onToCurrencyChange() {
    // If user selects the same currency as source, swap them
    if (this.toCurrency === this.fromCurrency) {
      const differentCurrency = this.currencies.find(c => c.code !== this.toCurrency);
      if (differentCurrency) {
        this.fromCurrency = differentCurrency.code;
      }
    }
    this.saveToLocalStorage();
    this.getCurrencyData();
  }

  currencyChanged() {
    // Prevent same currency on both sides
    if (this.fromCurrency === this.toCurrency) {
      // Find a different currency for the target
      const differentCurrency = this.currencies.find(c => c.code !== this.fromCurrency);
      if (differentCurrency) {
        this.toCurrency = differentCurrency.code;
      }
    }
    this.getCurrencyData();
  }

  swapCurrency(event: Event) {
    event.preventDefault();
    const tempCurrency = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = tempCurrency;
    this.getCurrencyData();
  }

  // Money printer go BRRR feature!
  activateMoneyPrinter() {
    if (this.isPrinting) return;
    
    this.isPrinting = true;
    const funnyMessages = [
      "🖨️ MONEY PRINTER GO BRRRRR!!!",
      "💸 Federal Reserve has entered the chat...",
      "🚁 Helicopter money incoming!",
      "📈 Stonks only go up!",
      "💰 Quantitative easing activated!",
      "🤑 Your wallet is now heavier!"
    ];
    
    this.printingMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
    
    // Create money rain effect
    this.createMoneyRain();
    
    // Add BRRRR sound effect text
    this.animateBRRRR();
    
    // Multiply the amount by a random factor (10x to 1000x)
    const multiplier = Math.floor(Math.random() * 991) + 10; // 10 to 1000
    const originalAmount = this.amount;
    this.amount = originalAmount * multiplier;
    this.isConvertingFromSource = true;
    this.convertMoney();
    
    // Reset after 3 seconds with a funny message
    setTimeout(() => {
      this.amount = originalAmount;
      this.convertMoney();
      this.printingMessage = "💔 Reality check: Inflation has caught up!";
      
      setTimeout(() => {
        this.isPrinting = false;
        this.printingMessage = '';
        this.moneyEmojis = [];
        this.brrrrText = '';
      }, 2000);
    }, 3000);
  }
  
  private createMoneyRain() {
    const emojis = ['💵', '💴', '💶', '💷', '💰', '💸', '🤑'];
    this.moneyEmojis = [];
    
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        if (this.isPrinting) {
          const emoji = emojis[Math.floor(Math.random() * emojis.length)];
          const left = Math.random() * 90 + 5; // Random position between 5% and 95%
          const delay = Math.random() * 0.5; // Random delay up to 0.5s
          
          this.moneyEmojis.push({
            emoji: emoji,
            left: `${left}%`,
            animationDelay: `${delay}s`
          });
          
          // Remove old emojis to prevent overflow
          if (this.moneyEmojis.length > 15) {
            this.moneyEmojis.shift();
          }
        }
      }, i * 100);
    }
  }
  
  private animateBRRRR() {
    let count = 0;
    const interval = setInterval(() => {
      if (count < 30) {
        this.brrrrText += 'R';
        count++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  }
}
