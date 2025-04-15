import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';  // Import the new advanced CSS

// Use your Finnhub API key here
const API_KEY = "cvudahhr01qjg13933m0cvudahhr01qjg13933mg";

// Function to fetch the stock price from Finnhub API
const fetchStockPrice = async (symbol) => {
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
    );
    return {
      current: response.data.c,  // Current price
      high: response.data.h,     // High price
      low: response.data.l,      // Low price
      open: response.data.o,     // Open price
      prevClose: response.data.pc // Previous close price
    };
  } catch (error) {
    console.error("Error fetching stock data", error);
    return null;
  }
};

function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [prices, setPrices] = useState({});

  const addStock = async () => {
    const upperSymbol = symbol.toUpperCase();
    if (!upperSymbol || portfolio.includes(upperSymbol)) return;
    const stockData = await fetchStockPrice(upperSymbol);
    if (stockData) {
      setPortfolio([...portfolio, upperSymbol]);
      setPrices((prev) => ({ ...prev, [upperSymbol]: stockData.current }));
    }
    setSymbol("");
  };

  const removeStock = (symbolToRemove) => {
    setPortfolio(portfolio.filter((s) => s !== symbolToRemove));
    setPrices((prev) => {
      const updated = { ...prev };
      delete updated[symbolToRemove];
      return updated;
    });
  };

  const refreshPrices = async () => {
    const updatedPrices = {};
    for (const sym of portfolio) {
      const stockData = await fetchStockPrice(sym);
      if (stockData) updatedPrices[sym] = stockData.current;
    }
    setPrices(updatedPrices);
  };

  useEffect(() => {
    const savedPortfolio = JSON.parse(localStorage.getItem('portfolio')) || [];
    setPortfolio(savedPortfolio);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }, [portfolio]);
  

  const totalValue = Object.values(prices).reduce((acc, val) => acc + val, 0);

  return (
    <div className="container">
      <h1>📈 Stock Portfolio Tracker</h1>
      <div className="input-section">
        <input
          type="text"
          placeholder="Enter stock symbol (e.g., AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <button onClick={addStock}>Add</button>
      </div>

      <div>
        <h2>Portfolio</h2>
        {portfolio.length === 0 ? (
          <p>No stocks added yet.</p>
        ) : (
          <ul>
            {portfolio.map((sym) => (
              <li key={sym}>
                {sym}: ${prices[sym]?.toFixed(2) || "Loading..."}
                <button onClick={() => removeStock(sym)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <h3>Total Value: ${totalValue.toFixed(2)}</h3>
      </div>

      <footer>
        <p>&copy; 2025 Stock Portfolio Tracker. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;
