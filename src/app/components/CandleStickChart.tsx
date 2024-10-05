"use client"
import React, { useContext, useEffect, useRef, useState } from 'react'
import DisplayChart from './DisplayChart'
import { CandlestickData, Time } from 'lightweight-charts';
import { IKlineData, SettingsToolContext, Timeframe } from '../page';
import { fetchCandlestickData } from '@/utils/historicalDataHelper';
import { getLivePriceUsingWebSockets } from '@/api/binance';

const CandleStickChart = () => {
    const [charWidth, setCharWidth] = useState<number>(0)
    const [charHeight, setCharHeight] = useState<number>(0)
    const historicalChartRef = useRef<HTMLDivElement>(null)
    const [candleStickData, setCandleStickData] = useState<IKlineData []>([])
    const settingsToolContext = useContext(SettingsToolContext);
    const [currentCandleStickValue, setCurrentCandleStickValue] = useState<IKlineData|null>(null)

    useEffect(() => {
        if(historicalChartRef.current) {
            setCharWidth(historicalChartRef.current.clientWidth-100)
            setCharHeight(historicalChartRef.current.clientHeight-100)
        }
    }, [])

    useEffect(() => {
      if(currentCandleStickValue && !candleStickData.find((data) => data.time == currentCandleStickValue?.time)) {
        setCandleStickData(prevstate => ([...prevstate, currentCandleStickValue]))
      }
    }, [setCandleStickData, currentCandleStickValue])

    useEffect(() => {
      const setCandleStickHistoricalData = async (selectedTimeFrame: Timeframe) => {
        const data = await fetchCandlestickData(selectedTimeFrame)
        if(data) {
          setCandleStickData(data)
        }
      }

      if(settingsToolContext?.timeFrame) {
          setCandleStickHistoricalData(settingsToolContext?.timeFrame)
      }
    }, [settingsToolContext?.timeFrame, settingsToolContext?.selectedChartType, setCandleStickData])

  return (
    <div className='flex-1' ref={historicalChartRef}>
      {candleStickData.length>0 &&
        <DisplayChart width={charWidth} height={charHeight} candleStickData={candleStickData} />
      }
    </div>
  )
}

export default CandleStickChart
