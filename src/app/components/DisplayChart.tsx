"use client"
import React, { useContext, useEffect, useRef, useState } from 'react';
import { CandlestickData, createChart, CrosshairMode, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { calculateBollingerBands } from '@/utils/indicators';
import HandymanIcon from '@mui/icons-material/Handyman';
import { Box, IconButton, Tooltip } from '@mui/material';
import { IKlineData, SettingsToolContext } from '../page';
import { getLivePriceUsingWebSockets } from '@/api/binance';

interface IProps {
  width: number;
  height: number;
  candleStickData: IKlineData[]
}

const xspan = 60;




const DisplayChart = (props: IProps) => {
  const settingsToolContext = useContext(SettingsToolContext);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const [isDrawingLine, setIsDrawingLine] = useState<boolean>(false)
  const [startingPoint, setStartingPoint] = useState<{ time: Time, value: number } | null>(null);
  const [candleStickChart, setCandleStickChart] = useState<IChartApi | null>(null);
  const [clickPoint, setClickPoint] = useState<{ time: Time, value: number } | null>(null)
  const [cursorPoint, setCursorPoint] = useState<{ time: Time, value: number } | null>(null);
  const middlebollingerBandSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const upperbollingerBandSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const lowerbollingerBandSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)

  // Draw candle-stick
  useEffect(() => {
    if (chartContainerRef.current) {
      // create candle-stick
      const chart = createChart(chartContainerRef.current, {
        width: props.width,
        height: props.height,
        layout: {
          background: { color: '#ffffff' },
          textColor: '#333',
        },
        crosshair: {
          mode: CrosshairMode.Normal
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
      });
      setCandleStickChart(chart)
      const candlestickSeries = chart.addCandlestickSeries();
      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;
      setCandlestickSeries(candlestickSeries)

      // const volumeSeries = chart.addHistogramSeries({
      //   color: '#26a69a',
      //   priceFormat: {
      //     type: 'volume',
      //   },
      // });

      // const volumeData = props.candleStickData.map(data => ({
      //   time: data.time,
      //   value: data.volume,  // assuming volume is present in the IKlineData interface
      //   color: data.close > data.open ? '#26a69a' : '#ef5350', // green if the price increased, red if decreased
      // }));

      // volumeSeries.setData(volumeData)

      const myClickHandler = (param: MouseEvent<Time>) => {
        setIsDrawingLine(true)
        const xTs: Time = param.time ? param.time : Number(props.candleStickData[0].time) + param.logical * xspan as unknown as Time
        const yPrice: number | null = candlestickSeries.coordinateToPrice(param.point.y || 0)
        if (yPrice) {
          setClickPoint({ time: xTs, value: yPrice })
        }
      }
      function myCrosshairMoveHandler(param: any) {
        if (!param.point) {
          return;
        }
        const xTs: Time = param.time ? param.time : Number(props.candleStickData[0].time) + param.logical * xspan
        const yPrice: number | null = candlestickSeries.coordinateToPrice(param.point.y || 0)
        if (yPrice && isDrawingLine) {
          setClickPoint({ time: xTs, value: yPrice })
        }
      }
      chart.subscribeClick(myClickHandler)
      chart.subscribeCrosshairMove(myCrosshairMoveHandler)
      return () => {
        chart.remove();
        setCandleStickChart(null);
      };
    }
  }, [props.height, props.width]);

  useEffect(() => {
    const handleGetRealtimeMessage = (data: any) => {
      if(candlestickSeries) {
        try {
          candlestickSeries.update({
            open: Number(data.k.o),
            high: Number(data.k.h),
            low: Number(data.k.l),
            close: Number(data.k.c),
            time: Math.floor(new Date(data.k.T).getTime() / 1000) as unknown as Time,
          })
        }
        catch (error) {
          console.error(`failed to update candle stick series at keyframe: ${settingsToolContext?.timeFrame}, data: ${data}`)
        }
      }
    }
    if(candlestickSeries) {
      candlestickSeries.setData([])
      candlestickSeries.setData(props.candleStickData);
      const setCandleStickRealtimeData = async () => {
        if(settingsToolContext?.timeFrame)
        await getLivePriceUsingWebSockets(handleGetRealtimeMessage, settingsToolContext?.timeFrame)
      }
      setCandleStickRealtimeData()
    }
  }, [settingsToolContext?.timeFrame, props.candleStickData])

  // Draw Bollinger Band
  useEffect(() => {
    if(settingsToolContext && candleStickChart) {
      // remove if previous Bollinger Band exists
      if(middlebollingerBandSeriesRef.current) {
        candleStickChart.removeSeries(middlebollingerBandSeriesRef.current)
      }
      if(upperbollingerBandSeriesRef.current) {
        candleStickChart.removeSeries(upperbollingerBandSeriesRef.current)
      }
      if(lowerbollingerBandSeriesRef.current) {
        candleStickChart.removeSeries(lowerbollingerBandSeriesRef.current)
      }

      const bollingerBands = calculateBollingerBands(props.candleStickData, settingsToolContext?.bollingerBand.period, settingsToolContext?.bollingerBand.stdDeviation);
      const middlebollingerBandSeries = candleStickChart.addLineSeries({ color: "red", lineWidth: 1 });
      middlebollingerBandSeriesRef.current = middlebollingerBandSeries;
      middlebollingerBandSeries.setData([...bollingerBands.filter(band => band.middleBand && band.upperBand && band.lowerBand).map((band) => {
        return {
          time: band.time,
          value: band.middleBand
        }
      })])

      const upperbollingerBandSeries = candleStickChart.addLineSeries({ color: "gray", lineWidth: 1 });
      upperbollingerBandSeriesRef.current = upperbollingerBandSeries;
      upperbollingerBandSeries.setData([...bollingerBands.filter(band => band.middleBand && band.upperBand && band.lowerBand).map((band) => {
        return {
          time: band.time,
          value: band.upperBand
        }
      })])

      const lowerbollingerBandSeries = candleStickChart.addLineSeries({ color: "green", lineWidth: 1 });
      lowerbollingerBandSeriesRef.current = lowerbollingerBandSeries;

      lowerbollingerBandSeries.setData([...bollingerBands.filter(band => band.middleBand && band.upperBand && band.lowerBand).map((band) => {
        return {
          time: band.time,
          value: band.lowerBand
        }
      })])
    }
  }, [candleStickChart, settingsToolContext, props.candleStickData])

  useEffect(() => {
    if (candleStickChart && isDrawingLine) {
      const fibbonaciRetracementSeries = candleStickChart.addLineSeries({ color: "gray", lineWidth: 1 });
      if (startingPoint && clickPoint) {
        fibbonaciRetracementSeries.setData([startingPoint, clickPoint])
        setStartingPoint(null)
        setIsDrawingLine(false)
      }
      else if (clickPoint) {
        fibbonaciRetracementSeries.setData([clickPoint])
        setStartingPoint(clickPoint);
      }
    }
  }, [clickPoint, candleStickChart])

  return (
    <Box className='flex flex-col items-center justify-center'>
      <Box ref={chartContainerRef} />
    </Box>
  );
};

export default DisplayChart;
