import { Timeframe } from '@/app/page';
import { connectToWebSocket } from '@/utils/web-socket';
import axios from 'axios';

const BINANCE_API_URL = 'https://api.binance.com/api/v3';

export interface KlineData {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteAssetVolume: string;
    numberOfTrades: number;
    takerBuyBaseAssetVolume: string;
    takerBuyQuoteAssetVolume: string;
    ignore: string;
}

export async function getHistoricalData(symbol: string, interval: string, limit: number = 500): Promise<KlineData[]> {
    try {
        const response = await axios.get(`${BINANCE_API_URL}/klines`, {
            params: {
                symbol,
                interval,
                limit,
            },
        });

        return response.data.map((kline: any[]) => ({
            openTime: kline[0],
            open: kline[1],
            high: kline[2],
            low: kline[3],
            close: kline[4],
            volume: kline[5],
            closeTime: kline[6],
            quoteAssetVolume: kline[7],
            numberOfTrades: kline[8],
            takerBuyBaseAssetVolume: kline[9],
            takerBuyQuoteAssetVolume: kline[10],
            ignore: kline[11],
        }));
    } catch (error) {
        console.error('Error fetching historical data:', error);
        throw error;
    }
}

export async function getLivePrice(symbol: string): Promise<number> {
    try {
        const response = await axios.get(`${BINANCE_API_URL}/ticker/price`, {
            params: { symbol },
        });
        return parseFloat(response.data.price);
    } catch (error) {
        console.error('Error fetching live price:', error);
        throw error;
    }
}

export async function getLivePriceUsingWebSockets(handleMessage: (data: any) => void, timeframe: Timeframe) {
    try {
        const wsUrl = `wss://stream.binance.com:9443/ws/btcusdt@kline_${timeframe}`;
        connectToWebSocket(wsUrl, handleMessage);
    } catch (error) {
        throw error
    }
}