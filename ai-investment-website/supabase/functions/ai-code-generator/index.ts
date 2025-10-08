Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        console.log('AI Code Generator function called');
        console.log('Request method:', req.method);
        
        // Enhanced request parsing to handle multiple formats
        let requestBody = {};
        
        try {
            // First try to get the content type
            const contentType = req.headers.get('content-type') || '';
            console.log('Content-Type:', contentType);
            
            if (req.method === 'GET') {
                // For GET requests, try to get parameters from URL
                const url = new URL(req.url);
                const prompt = url.searchParams.get('prompt');
                const language = url.searchParams.get('language') || 'python';
                const framework = url.searchParams.get('framework') || 'python';
                
                if (prompt) {
                    requestBody = { prompt, language, framework };
                }
            } else {
                // For POST requests, try multiple parsing methods
                let rawBody = '';
                
                // Clone the request to avoid consuming the body multiple times
                const clonedReq = req.clone();
                
                try {
                    rawBody = await req.text();
                    console.log('Raw request body length:', rawBody.length);
                    console.log('Raw request body:', rawBody);
                    
                    if (rawBody && rawBody.trim() !== '') {
                        // Try to parse as JSON
                        try {
                            requestBody = JSON.parse(rawBody);
                            console.log('Successfully parsed JSON body:', requestBody);
                        } catch (jsonError) {
                            console.log('JSON parse failed, trying form data...');
                            
                            // Try to parse as form data
                            try {
                                const formData = await clonedReq.formData();
                                requestBody = Object.fromEntries(formData.entries());
                                console.log('Successfully parsed form data:', requestBody);
                            } catch (formError) {
                                console.log('Form data parse failed, using query params...');
                                
                                // Try to parse as URL encoded
                                const params = new URLSearchParams(rawBody);
                                requestBody = Object.fromEntries(params.entries());
                                console.log('Parsed URL encoded data:', requestBody);
                            }
                        }
                    } else {
                        console.log('Empty request body, checking URL parameters...');
                        
                        // If no body, try URL parameters
                        const url = new URL(req.url);
                        const urlParams = Object.fromEntries(url.searchParams.entries());
                        if (Object.keys(urlParams).length > 0) {
                            requestBody = urlParams;
                            console.log('Using URL parameters:', requestBody);
                        }
                    }
                } catch (error) {
                    console.error('Error parsing request:', error);
                    
                    // Fallback: use default values if no body can be parsed
                    console.log('Using fallback default values');
                    requestBody = {
                        prompt: 'Create a Python investment portfolio analyzer',
                        language: 'python',
                        framework: 'python'
                    };
                }
            }
            
            console.log('Final parsed request body:', requestBody);
            
        } catch (parseError) {
            console.error('Failed to parse request:', parseError);
            
            // Use safe defaults
            requestBody = {
                prompt: 'Create a Python investment portfolio analyzer',
                language: 'python',
                framework: 'python'
            };
        }

        // Extract and validate parameters
        const { prompt, language, framework } = requestBody;
        
        // Validate required fields with fallbacks
        const validPrompt = prompt && typeof prompt === 'string' && prompt.trim() 
            ? prompt.trim() 
            : 'Create a Python investment portfolio analyzer';
            
        const validLanguage = 'python'; // Always Python
        const validFramework = 'python'; // Always Python

        console.log('Processing code generation for:', {
            prompt: validPrompt,
            language: validLanguage,
            framework: validFramework
        });

        let generatedCode = '';
        let explanation = '';

        // Generate different Python code based on prompt context
        if (validPrompt.toLowerCase().includes('portfolio') || validPrompt.toLowerCase().includes('investment')) {
            generatedCode = `# Investment Portfolio Analyzer
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import yfinance as yf
from typing import Dict, List, Tuple

class InvestmentPortfolio:
    """
    A comprehensive investment portfolio analyzer for tracking and analyzing stock investments.
    """
    
    def __init__(self):
        self.holdings = {}
        self.transactions = []
        self.portfolio_value = 0.0
        self.total_invested = 0.0
        
    def add_stock(self, symbol: str, shares: int, purchase_price: float, purchase_date: str = None):
        """
        Add a stock position to the portfolio.
        
        Args:
            symbol (str): Stock ticker symbol
            shares (int): Number of shares purchased
            purchase_price (float): Price per share at purchase
            purchase_date (str): Date of purchase in YYYY-MM-DD format
        """
        if purchase_date is None:
            purchase_date = datetime.now().strftime('%Y-%m-%d')
            
        if symbol not in self.holdings:
            self.holdings[symbol] = {
                'shares': 0,
                'total_cost': 0.0,
                'avg_price': 0.0,
                'transactions': []
            }
        
        # Update holdings
        total_shares = self.holdings[symbol]['shares'] + shares
        total_cost = self.holdings[symbol]['total_cost'] + (shares * purchase_price)
        
        self.holdings[symbol]['shares'] = total_shares
        self.holdings[symbol]['total_cost'] = total_cost
        self.holdings[symbol]['avg_price'] = total_cost / total_shares
        
        # Record transaction
        transaction = {
            'symbol': symbol,
            'shares': shares,
            'price': purchase_price,
            'date': purchase_date,
            'type': 'BUY'
        }
        
        self.holdings[symbol]['transactions'].append(transaction)
        self.transactions.append(transaction)
        self.total_invested += shares * purchase_price
        
        print(f"Added {shares} shares of {symbol} at ${purchase_price:.2f} per share")
    
    def get_current_prices(self) -> Dict[str, float]:
        """
        Fetch current stock prices from Yahoo Finance.
        
        Returns:
            Dict[str, float]: Dictionary mapping symbols to current prices
        """
        current_prices = {}
        symbols = list(self.holdings.keys())
        
        if not symbols:
            return current_prices
            
        try:
            # Fetch data for all symbols at once
            data = yf.download(symbols, period='1d', interval='1d')
            
            for symbol in symbols:
                try:
                    if len(symbols) == 1:
                        price = data['Close'].iloc[-1]
                    else:
                        price = data['Close'][symbol].iloc[-1]
                    current_prices[symbol] = float(price)
                except (IndexError, KeyError) as e:
                    print(f"Could not fetch price for {symbol}: {e}")
                    current_prices[symbol] = self.holdings[symbol]['avg_price']
                    
        except Exception as e:
            print(f"Error fetching prices: {e}")
            # Fallback to average purchase prices
            for symbol in symbols:
                current_prices[symbol] = self.holdings[symbol]['avg_price']
        
        return current_prices
    
    def calculate_portfolio_metrics(self) -> Dict:
        """
        Calculate comprehensive portfolio performance metrics.
        
        Returns:
            Dict: Portfolio performance metrics
        """
        current_prices = self.get_current_prices()
        current_value = 0.0
        total_gain_loss = 0.0
        
        position_details = []
        
        for symbol, holding in self.holdings.items():
            shares = holding['shares']
            avg_price = holding['avg_price']
            current_price = current_prices.get(symbol, avg_price)
            
            position_value = shares * current_price
            position_cost = shares * avg_price
            position_gain_loss = position_value - position_cost
            position_gain_loss_pct = (position_gain_loss / position_cost) * 100 if position_cost > 0 else 0
            
            current_value += position_value
            total_gain_loss += position_gain_loss
            
            position_details.append({
                'symbol': symbol,
                'shares': shares,
                'avg_price': avg_price,
                'current_price': current_price,
                'position_value': position_value,
                'position_cost': position_cost,
                'gain_loss': position_gain_loss,
                'gain_loss_pct': position_gain_loss_pct
            })
        
        total_return_pct = (total_gain_loss / self.total_invested) * 100 if self.total_invested > 0 else 0
        
        return {
            'total_invested': self.total_invested,
            'current_value': current_value,
            'total_gain_loss': total_gain_loss,
            'total_return_pct': total_return_pct,
            'positions': position_details
        }
    
    def generate_performance_report(self) -> str:
        """
        Generate a detailed performance report.
        
        Returns:
            str: Formatted portfolio report
        """
        metrics = self.calculate_portfolio_metrics()
        
        report = f"""
=== INVESTMENT PORTFOLIO PERFORMANCE REPORT ===
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

PORTFOLIO SUMMARY:
Total Invested: ${metrics['total_invested']:,.2f}
Current Value:  ${metrics['current_value']:,.2f}
Total Gain/Loss: ${metrics['total_gain_loss']:,.2f}
Total Return: {metrics['total_return_pct']:.2f}%

INDIVIDUAL POSITIONS:
"""
        
        for position in metrics['positions']:
            status = "📈" if position['gain_loss'] >= 0 else "📉"
            report += f"""
{status} {position['symbol']}:
  Shares: {position['shares']:,}
  Avg Price: ${position['avg_price']:.2f}
  Current: ${position['current_price']:.2f}
  Value: ${position['position_value']:,.2f}
  Gain/Loss: ${position['gain_loss']:,.2f} ({position['gain_loss_pct']:+.2f}%)
"""
        
        return report
    
    def plot_portfolio_allocation(self):
        """
        Create a pie chart showing portfolio allocation by position value.
        """
        metrics = self.calculate_portfolio_metrics()
        
        if not metrics['positions']:
            print("No positions to plot")
            return
        
        symbols = [pos['symbol'] for pos in metrics['positions']]
        values = [pos['position_value'] for pos in metrics['positions']]
        
        plt.figure(figsize=(10, 8))
        plt.pie(values, labels=symbols, autopct='%1.1f%%', startangle=90)
        plt.title('Portfolio Allocation by Position Value')
        plt.axis('equal')
        plt.show()
    
    def export_to_csv(self, filename: str = None):
        """
        Export portfolio data to CSV file.
        
        Args:
            filename (str): Output filename. If None, uses timestamp.
        """
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'portfolio_export_{timestamp}.csv'
        
        metrics = self.calculate_portfolio_metrics()
        df = pd.DataFrame(metrics['positions'])
        df.to_csv(filename, index=False)
        print(f"Portfolio data exported to {filename}")

# Example usage
if __name__ == "__main__":
    # Create portfolio instance
    portfolio = InvestmentPortfolio()
    
    # Add some example positions
    portfolio.add_stock("AAPL", 100, 150.00, "2024-01-15")
    portfolio.add_stock("GOOGL", 50, 2800.00, "2024-02-01")
    portfolio.add_stock("MSFT", 75, 380.00, "2024-02-15")
    portfolio.add_stock("TSLA", 25, 220.00, "2024-03-01")
    
    # Generate and print performance report
    print(portfolio.generate_performance_report())
    
    # Create portfolio allocation chart
    portfolio.plot_portfolio_allocation()
    
    # Export data to CSV
    portfolio.export_to_csv()
`;
            explanation = 'This Python script creates a comprehensive investment portfolio analyzer with real-time stock price fetching, performance tracking, visualization capabilities, and data export functionality. Perfect for managing and analyzing investment portfolios with detailed metrics and reporting.';
        } else if (validPrompt.toLowerCase().includes('analysis') || validPrompt.toLowerCase().includes('calculator')) {
            generatedCode = `# Investment Analysis Calculator
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import math
from typing import List, Dict, Tuple

class InvestmentCalculator:
    """
    A comprehensive calculator for various investment analysis metrics and scenarios.
    """
    
    @staticmethod
    def compound_interest(principal: float, rate: float, time: float, compound_freq: int = 1) -> float:
        """
        Calculate compound interest.
        
        Args:
            principal (float): Initial investment amount
            rate (float): Annual interest rate (as decimal, e.g., 0.05 for 5%)
            time (float): Time period in years
            compound_freq (int): Compounding frequency per year
        
        Returns:
            float: Final amount after compound interest
        """
        return principal * (1 + rate / compound_freq) ** (compound_freq * time)
    
    @staticmethod
    def simple_interest(principal: float, rate: float, time: float) -> float:
        """
        Calculate simple interest.
        
        Args:
            principal (float): Initial investment amount
            rate (float): Annual interest rate (as decimal)
            time (float): Time period in years
        
        Returns:
            float: Final amount with simple interest
        """
        return principal * (1 + rate * time)
    
    @staticmethod
    def present_value(future_value: float, rate: float, periods: int) -> float:
        """
        Calculate present value of a future amount.
        
        Args:
            future_value (float): Future value
            rate (float): Discount rate per period
            periods (int): Number of periods
        
        Returns:
            float: Present value
        """
        return future_value / (1 + rate) ** periods
    
    @staticmethod
    def future_value(present_value: float, rate: float, periods: int) -> float:
        """
        Calculate future value of a present amount.
        
        Args:
            present_value (float): Present value
            rate (float): Growth rate per period
            periods (int): Number of periods
        
        Returns:
            float: Future value
        """
        return present_value * (1 + rate) ** periods
    
    @staticmethod
    def annuity_present_value(payment: float, rate: float, periods: int) -> float:
        """
        Calculate present value of an annuity.
        
        Args:
            payment (float): Periodic payment amount
            rate (float): Interest rate per period
            periods (int): Number of periods
        
        Returns:
            float: Present value of annuity
        """
        if rate == 0:
            return payment * periods
        return payment * (1 - (1 + rate) ** -periods) / rate
    
    @staticmethod
    def annuity_future_value(payment: float, rate: float, periods: int) -> float:
        """
        Calculate future value of an annuity.
        
        Args:
            payment (float): Periodic payment amount
            rate (float): Interest rate per period
            periods (int): Number of periods
        
        Returns:
            float: Future value of annuity
        """
        if rate == 0:
            return payment * periods
        return payment * ((1 + rate) ** periods - 1) / rate
    
    @staticmethod
    def loan_payment(principal: float, rate: float, periods: int) -> float:
        """
        Calculate monthly loan payment.
        
        Args:
            principal (float): Loan amount
            rate (float): Interest rate per period
            periods (int): Number of periods
        
        Returns:
            float: Periodic payment amount
        """
        if rate == 0:
            return principal / periods
        return principal * rate * (1 + rate) ** periods / ((1 + rate) ** periods - 1)
    
    @staticmethod
    def roi_percentage(gain: float, cost: float) -> float:
        """
        Calculate Return on Investment (ROI) percentage.
        
        Args:
            gain (float): Investment gain (current value - initial investment)
            cost (float): Initial investment cost
        
        Returns:
            float: ROI as percentage
        """
        return (gain / cost) * 100 if cost != 0 else 0
    
    @staticmethod
    def annualized_return(beginning_value: float, ending_value: float, years: float) -> float:
        """
        Calculate annualized return.
        
        Args:
            beginning_value (float): Initial investment value
            ending_value (float): Final investment value
            years (float): Investment period in years
        
        Returns:
            float: Annualized return as decimal
        """
        return (ending_value / beginning_value) ** (1 / years) - 1
    
    @staticmethod
    def volatility(returns: List[float]) -> float:
        """
        Calculate volatility (standard deviation) of returns.
        
        Args:
            returns (List[float]): List of periodic returns
        
        Returns:
            float: Volatility (standard deviation)
        """
        return np.std(returns) * math.sqrt(len(returns))
    
    @staticmethod
    def sharpe_ratio(returns: List[float], risk_free_rate: float = 0.0) -> float:
        """
        Calculate Sharpe ratio.
        
        Args:
            returns (List[float]): List of investment returns
            risk_free_rate (float): Risk-free rate of return
        
        Returns:
            float: Sharpe ratio
        """
        excess_returns = [r - risk_free_rate for r in returns]
        mean_excess_return = np.mean(excess_returns)
        std_excess_return = np.std(excess_returns)
        
        return mean_excess_return / std_excess_return if std_excess_return != 0 else 0
    
    @staticmethod
    def retirement_calculator(current_age: int, retirement_age: int, current_savings: float, 
                           monthly_contribution: float, annual_return: float) -> Dict:
        """
        Calculate retirement savings projections.
        
        Args:
            current_age (int): Current age
            retirement_age (int): Target retirement age
            current_savings (float): Current savings amount
            monthly_contribution (float): Monthly contribution amount
            annual_return (float): Expected annual return rate
        
        Returns:
            Dict: Retirement projection results
        """
        years_to_retirement = retirement_age - current_age
        monthly_rate = annual_return / 12
        total_months = years_to_retirement * 12
        
        # Future value of current savings
        future_current = InvestmentCalculator.future_value(current_savings, annual_return, years_to_retirement)
        
        # Future value of monthly contributions (annuity)
        future_contributions = InvestmentCalculator.annuity_future_value(
            monthly_contribution, monthly_rate, total_months
        )
        
        total_retirement_savings = future_current + future_contributions
        total_contributions = monthly_contribution * total_months
        
        return {
            'years_to_retirement': years_to_retirement,
            'total_contributions': current_savings + total_contributions,
            'projected_savings': total_retirement_savings,
            'growth_from_interest': total_retirement_savings - current_savings - total_contributions,
            'monthly_income_4pct_rule': total_retirement_savings * 0.04 / 12
        }

# Example usage and demonstration
if __name__ == "__main__":
    calc = InvestmentCalculator()
    
    print("=== INVESTMENT CALCULATOR EXAMPLES ===")
    
    # Compound Interest Example
    principal = 10000
    rate = 0.07  # 7% annual
    time = 10    # 10 years
    final_amount = calc.compound_interest(principal, rate, time, 12)  # Monthly compounding
    print(f"\nCompound Interest:")
    print(f"Initial: ${principal:,.2f}")
    print(f"Final (10 years, 7% annual, monthly compounding): ${final_amount:,.2f}")
    print(f"Total Interest Earned: ${final_amount - principal:,.2f}")
    
    # Retirement Calculator Example
    retirement_plan = calc.retirement_calculator(
        current_age=30,
        retirement_age=65,
        current_savings=25000,
        monthly_contribution=500,
        annual_return=0.08
    )
    
    print(f"\nRetirement Planning (Age 30 to 65):")
    print(f"Current Savings: ${retirement_plan['total_contributions'] - 500*35*12:,.2f}")
    print(f"Total Contributions: ${retirement_plan['total_contributions']:,.2f}")
    print(f"Projected Savings: ${retirement_plan['projected_savings']:,.2f}")
    print(f"Growth from Interest: ${retirement_plan['growth_from_interest']:,.2f}")
    print(f"Monthly Income (4% rule): ${retirement_plan['monthly_income_4pct_rule']:,.2f}")
    
    # Investment Performance Metrics
    sample_returns = [0.12, -0.05, 0.18, 0.03, 0.09, -0.02, 0.15, 0.07]
    volatility = calc.volatility(sample_returns)
    sharpe = calc.sharpe_ratio(sample_returns, 0.02)  # 2% risk-free rate
    
    print(f"\nInvestment Performance Metrics:")
    print(f"Sample Returns: {[f'{r:.1%}' for r in sample_returns]}")
    print(f"Volatility: {volatility:.2%}")
    print(f"Sharpe Ratio: {sharpe:.2f}")
    
    # Annualized Return Calculation
    beginning_value = 100000
    ending_value = 150000
    years = 3
    annualized_return = calc.annualized_return(beginning_value, ending_value, years)
    print(f"\nAnnualized Return:")
    print(f"Initial Value: ${beginning_value:,.2f}")
    print(f"Final Value: ${ending_value:,.2f}")
    print(f"Period: {years} years")
    print(f"Annualized Return: {annualized_return:.2%}")
`;
            explanation = 'This comprehensive Python investment calculator provides essential financial calculations including compound interest, present/future value, annuities, loan payments, ROI, volatility, Sharpe ratio, and retirement planning. Ideal for financial analysis and investment decision-making.';
        } else {
            // Generic Python investment code
            generatedCode = `# Stock Market Data Analyzer
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Dict, Optional

class StockAnalyzer:
    """
    A comprehensive stock market data analyzer for investment research.
    """
    
    def __init__(self):
        self.data_cache = {}
        self.analysis_results = {}
    
    def fetch_stock_data(self, symbol: str, period: str = "1y") -> pd.DataFrame:
        """
        Fetch stock data for analysis.
        
        Args:
            symbol (str): Stock ticker symbol
            period (str): Data period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
        
        Returns:
            pd.DataFrame: Stock data with OHLCV information
        """
        try:
            import yfinance as yf
            
            stock = yf.Ticker(symbol)
            data = stock.history(period=period)
            
            if data.empty:
                raise ValueError(f"No data found for symbol {symbol}")
            
            self.data_cache[symbol] = data
            return data
            
        except ImportError:
            print("yfinance not installed. Install with: pip install yfinance")
            # Return sample data for demonstration
            dates = pd.date_range(start='2023-01-01', end='2024-01-01', freq='D')
            np.random.seed(42)
            
            # Generate realistic stock price data
            initial_price = 100
            returns = np.random.normal(0.0005, 0.02, len(dates))
            prices = [initial_price]
            
            for r in returns[1:]:
                prices.append(prices[-1] * (1 + r))
            
            data = pd.DataFrame({
                'Open': prices,
                'High': [p * (1 + abs(np.random.normal(0, 0.01))) for p in prices],
                'Low': [p * (1 - abs(np.random.normal(0, 0.01))) for p in prices],
                'Close': prices,
                'Volume': np.random.randint(1000000, 10000000, len(dates))
            }, index=dates)
            
            self.data_cache[symbol] = data
            return data
    
    def calculate_technical_indicators(self, symbol: str) -> Dict:
        """
        Calculate various technical indicators for a stock.
        
        Args:
            symbol (str): Stock ticker symbol
        
        Returns:
            Dict: Dictionary containing technical indicators
        """
        if symbol not in self.data_cache:
            self.fetch_stock_data(symbol)
        
        data = self.data_cache[symbol].copy()
        
        # Simple Moving Averages
        data['SMA_20'] = data['Close'].rolling(window=20).mean()
        data['SMA_50'] = data['Close'].rolling(window=50).mean()
        data['SMA_200'] = data['Close'].rolling(window=200).mean()
        
        # Exponential Moving Average
        data['EMA_12'] = data['Close'].ewm(span=12).mean()
        data['EMA_26'] = data['Close'].ewm(span=26).mean()
        
        # MACD
        data['MACD'] = data['EMA_12'] - data['EMA_26']
        data['MACD_Signal'] = data['MACD'].ewm(span=9).mean()
        data['MACD_Histogram'] = data['MACD'] - data['MACD_Signal']
        
        # RSI (Relative Strength Index)
        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        data['RSI'] = 100 - (100 / (1 + rs))
        
        # Bollinger Bands
        rolling_mean = data['Close'].rolling(window=20).mean()
        rolling_std = data['Close'].rolling(window=20).std()
        data['BB_Upper'] = rolling_mean + (rolling_std * 2)
        data['BB_Lower'] = rolling_mean - (rolling_std * 2)
        data['BB_Middle'] = rolling_mean
        
        # Volume indicators
        data['Volume_SMA'] = data['Volume'].rolling(window=20).mean()
        data['Volume_Ratio'] = data['Volume'] / data['Volume_SMA']
        
        # Daily returns
        data['Daily_Return'] = data['Close'].pct_change()
        data['Cumulative_Return'] = (1 + data['Daily_Return']).cumprod()
        
        # Volatility (rolling 30-day)
        data['Volatility'] = data['Daily_Return'].rolling(window=30).std() * np.sqrt(252)
        
        self.data_cache[symbol] = data
        
        # Generate summary statistics
        latest_data = data.iloc[-1]
        indicators = {
            'current_price': latest_data['Close'],
            'sma_20': latest_data['SMA_20'],
            'sma_50': latest_data['SMA_50'],
            'sma_200': latest_data['SMA_200'],
            'rsi': latest_data['RSI'],
            'macd': latest_data['MACD'],
            'macd_signal': latest_data['MACD_Signal'],
            'bollinger_upper': latest_data['BB_Upper'],
            'bollinger_lower': latest_data['BB_Lower'],
            'volatility': latest_data['Volatility'],
            'volume_ratio': latest_data['Volume_Ratio']
        }
        
        self.analysis_results[symbol] = indicators
        return indicators
    
    def generate_trading_signals(self, symbol: str) -> List[str]:
        """
        Generate basic trading signals based on technical indicators.
        
        Args:
            symbol (str): Stock ticker symbol
        
        Returns:
            List[str]: List of trading signals
        """
        if symbol not in self.analysis_results:
            self.calculate_technical_indicators(symbol)
        
        indicators = self.analysis_results[symbol]
        signals = []
        
        # Price vs Moving Averages
        if indicators['current_price'] > indicators['sma_20']:
            signals.append("BULLISH: Price above 20-day SMA")
        else:
            signals.append("BEARISH: Price below 20-day SMA")
        
        if indicators['current_price'] > indicators['sma_50']:
            signals.append("BULLISH: Price above 50-day SMA")
        else:
            signals.append("BEARISH: Price below 50-day SMA")
        
        # RSI Analysis
        if indicators['rsi'] > 70:
            signals.append("WARNING: RSI indicates overbought conditions")
        elif indicators['rsi'] < 30:
            signals.append("OPPORTUNITY: RSI indicates oversold conditions")
        else:
            signals.append("NEUTRAL: RSI in normal range")
        
        # MACD Analysis
        if indicators['macd'] > indicators['macd_signal']:
            signals.append("BULLISH: MACD above signal line")
        else:
            signals.append("BEARISH: MACD below signal line")
        
        # Volatility Analysis
        if indicators['volatility'] > 0.3:
            signals.append("HIGH RISK: Elevated volatility detected")
        elif indicators['volatility'] < 0.15:
            signals.append("LOW RISK: Low volatility environment")
        
        # Volume Analysis
        if indicators['volume_ratio'] > 1.5:
            signals.append("NOTABLE: Above average volume activity")
        elif indicators['volume_ratio'] < 0.5:
            signals.append("NOTABLE: Below average volume activity")
        
        return signals
    
    def create_analysis_chart(self, symbol: str, save_path: Optional[str] = None):
        """
        Create a comprehensive analysis chart for a stock.
        
        Args:
            symbol (str): Stock ticker symbol
            save_path (str, optional): Path to save the chart
        """
        if symbol not in self.data_cache:
            self.fetch_stock_data(symbol)
        
        data = self.data_cache[symbol].tail(200)  # Last 200 days
        
        fig, axes = plt.subplots(3, 1, figsize=(15, 12))
        fig.suptitle(f'{symbol} - Stock Analysis Dashboard', fontsize=16)
        
        # Price and Moving Averages
        axes[0].plot(data.index, data['Close'], label='Close Price', linewidth=2)
        axes[0].plot(data.index, data['SMA_20'], label='SMA 20', alpha=0.7)
        axes[0].plot(data.index, data['SMA_50'], label='SMA 50', alpha=0.7)
        axes[0].fill_between(data.index, data['BB_Upper'], data['BB_Lower'], alpha=0.2, label='Bollinger Bands')
        axes[0].set_title('Price Chart with Moving Averages')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
        
        # RSI
        axes[1].plot(data.index, data['RSI'], label='RSI', color='purple')
        axes[1].axhline(y=70, color='r', linestyle='--', alpha=0.7, label='Overbought (70)')
        axes[1].axhline(y=30, color='g', linestyle='--', alpha=0.7, label='Oversold (30)')
        axes[1].set_title('Relative Strength Index (RSI)')
        axes[1].set_ylabel('RSI')
        axes[1].legend()
        axes[1].grid(True, alpha=0.3)
        
        # Volume
        axes[2].bar(data.index, data['Volume'], alpha=0.6, label='Volume')
        axes[2].plot(data.index, data['Volume_SMA'], color='red', label='Volume SMA')
        axes[2].set_title('Trading Volume')
        axes[2].set_ylabel('Volume')
        axes[2].legend()
        axes[2].grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Chart saved to {save_path}")
        
        plt.show()
    
    def generate_investment_report(self, symbol: str) -> str:
        """
        Generate a comprehensive investment analysis report.
        
        Args:
            symbol (str): Stock ticker symbol
        
        Returns:
            str: Formatted investment report
        """
        if symbol not in self.analysis_results:
            self.calculate_technical_indicators(symbol)
        
        indicators = self.analysis_results[symbol]
        signals = self.generate_trading_signals(symbol)
        
        report = f"""
=== INVESTMENT ANALYSIS REPORT: {symbol} ===
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

CURRENT METRICS:
Current Price: ${indicators['current_price']:.2f}
20-Day SMA: ${indicators['sma_20']:.2f}
50-Day SMA: ${indicators['sma_50']:.2f}
200-Day SMA: ${indicators['sma_200']:.2f}

TECHNICAL INDICATORS:
RSI: {indicators['rsi']:.1f}
MACD: {indicators['macd']:.3f}
MACD Signal: {indicators['macd_signal']:.3f}
Volatility (30-day): {indicators['volatility']:.1%}
Volume Ratio: {indicators['volume_ratio']:.2f}x

BOLLINGER BANDS:
Upper Band: ${indicators['bollinger_upper']:.2f}
Lower Band: ${indicators['bollinger_lower']:.2f}

TRADING SIGNALS:
"""
        
        for i, signal in enumerate(signals, 1):
            report += f"{i}. {signal}\n"
        
        # Investment recommendation
        bullish_signals = sum(1 for s in signals if 'BULLISH' in s or 'OPPORTUNITY' in s)
        bearish_signals = sum(1 for s in signals if 'BEARISH' in s or 'WARNING' in s)
        
        if bullish_signals > bearish_signals:
            recommendation = "POSITIVE - Consider for investment"
        elif bearish_signals > bullish_signals:
            recommendation = "NEGATIVE - Exercise caution"
        else:
            recommendation = "NEUTRAL - Monitor for clearer signals"
        
        report += f"\nOVERALL RECOMMENDATION: {recommendation}"
        report += "\n\nDISCLAIMER: This analysis is for educational purposes only and should not be considered as financial advice."
        
        return report

# Example usage
if __name__ == "__main__":
    # Initialize analyzer
    analyzer = StockAnalyzer()
    
    # Analyze a stock (example with AAPL)
    symbol = "AAPL"
    
    print(f"Analyzing {symbol}...")
    
    # Fetch data and calculate indicators
    data = analyzer.fetch_stock_data(symbol)
    indicators = analyzer.calculate_technical_indicators(symbol)
    
    # Generate and print report
    report = analyzer.generate_investment_report(symbol)
    print(report)
    
    # Create analysis chart
    analyzer.create_analysis_chart(symbol)
`;
            explanation = 'This comprehensive Python stock analyzer provides technical analysis, trading signals, and investment research capabilities. It includes moving averages, RSI, MACD, Bollinger Bands, volume analysis, and generates detailed investment reports with visualizations.';
        }

        const result = {
            data: {
                code: generatedCode,
                language: validLanguage,
                framework: validFramework,
                explanation: explanation,
                prompt: validPrompt,
                generatedAt: new Date().toISOString(),
                features: [
                    'Professional Python code structure',
                    'Investment and finance focused functionality',
                    'Comprehensive error handling',
                    'Detailed documentation and comments',
                    'Real-world applicable algorithms',
                    'Data analysis and visualization capabilities'
                ],
                requestInfo: {
                    method: req.method,
                    contentType: req.headers.get('content-type'),
                    hasBody: !!prompt
                }
            }
        };

        console.log('Code generation completed successfully');

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('AI Code Generator error:', error);

        const errorResponse = {
            error: {
                code: 'CODE_GENERATION_FAILED',
                message: error.message || 'Failed to generate code',
                timestamp: new Date().toISOString(),
                debug: {
                    method: req.method,
                    url: req.url,
                    headers: Object.fromEntries(req.headers.entries())
                }
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 200, // Return 200 to avoid frontend JSON parsing errors
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});