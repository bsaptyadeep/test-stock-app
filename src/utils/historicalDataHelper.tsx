import { IKlineData } from "@/app/page";
import axios from "axios";
import { CandlestickData, Time } from "lightweight-charts";

export const fetchCandlestickData = async (interval: string) : Promise<IKlineData [] | undefined> => {
    try {
      const apiResponse = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}`
      );
      let result: IKlineData [] = [];
      if(apiResponse.data) {
        result = apiResponse.data.map((data: unknown[]) => {
            return { 
                open: Number(data[1]), 
                high: Number(data[2]), 
                low: Number(data[3]), 
                close: Number(data[4]), 
                time: (Number(data[0])/1000) as unknown as Time,
                volume: Number(data[5])
            };
        })
      }
      return result
    } catch (error) {
      console.error('Error fetching candlestick data:', error);
    }
  };