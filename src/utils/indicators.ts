import { Time } from "lightweight-charts";

interface PriceData {
    open: number;
    high: number;
    low: number;
    close: number;
    time: Time;
}

export function calculateBollingerBands(data: PriceData[], period: number, numStdDev: number) {
    // Function to calculate the Simple Moving Average (SMA)
    const calculateSMA = (data: number[], period: number) => {
        const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
        return sum / period;
    };

    // Function to calculate the standard deviation
    const calculateStandardDeviation = (data: number[], period: number, sma: number) => {
        const squaredDiffs = data.slice(-period).map(val => Math.pow(val - sma, 2));
        const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / period;
        return Math.sqrt(avgSquaredDiff);
    };

    // Extract the closing prices from the data
    const closingPrices = data.map(item => item.close);

    // Calculate the Bollinger Bands for each data point
    const result = data.map((_, index) => {
        if (index + 1 < period) {
            // Not enough data to calculate Bollinger Bands for this point
            return {
                time: data[index].time,
                middleBand: null,
                upperBand: null,
                lowerBand: null
            };
        }

        const recentPrices = closingPrices.slice(index + 1 - period, index + 1);
        const sma = calculateSMA(recentPrices, period);
        const stdDev = calculateStandardDeviation(recentPrices, period, sma);

        return {
            time: data[index].time,
            middleBand: sma,
            upperBand: sma + numStdDev * stdDev,
            lowerBand: sma - numStdDev * stdDev
        };
    });

    return result;
}

