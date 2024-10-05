"use client"
import React, { useContext, useEffect, useRef, useState } from 'react';
import { CandlestickData, createChart, CrosshairMode, IChartApi, ISeriesApi, LineStyle, Time } from 'lightweight-charts';
import { calculateBollingerBands, calculateFibonacciLevels } from '@/utils/indicators';
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
  const [endingPoint, setEndingPoint] = useState<{ time: Time, value: number } | null>(null);
  const [candleStickChart, setCandleStickChart] = useState<IChartApi | null>(null);
  const [clickPoint, setClickPoint] = useState<{ time: Time, value: number } | null>(null)
  const [cursorPoint, setCursorPoint] = useState<{ time: Time, value: number } | null>(null);
  const middlebollingerBandSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const upperbollingerBandSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const lowerbollingerBandSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const [isRemovedBollingerBand, setIsRemovedBollingerBand] = useState<boolean>(true);

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
    if(settingsToolContext?.showingBollingerBand && candleStickChart) {
      // remove if previous Bollinger Band exists
      if(!isRemovedBollingerBand) {
        if(middlebollingerBandSeriesRef.current) {
          candleStickChart.removeSeries(middlebollingerBandSeriesRef.current)
        }
        if(upperbollingerBandSeriesRef.current) {
          candleStickChart.removeSeries(upperbollingerBandSeriesRef.current)
        }
        if(lowerbollingerBandSeriesRef.current) {
          candleStickChart.removeSeries(lowerbollingerBandSeriesRef.current)
        }  
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
      setIsRemovedBollingerBand(false)
    } else if(!settingsToolContext?.showingBollingerBand && candleStickChart && !isRemovedBollingerBand) {
      if(middlebollingerBandSeriesRef.current) {
        candleStickChart.removeSeries(middlebollingerBandSeriesRef.current)
      }
      if(upperbollingerBandSeriesRef.current) {
        candleStickChart.removeSeries(upperbollingerBandSeriesRef.current)
      }
      if(lowerbollingerBandSeriesRef.current) {
        candleStickChart.removeSeries(lowerbollingerBandSeriesRef.current)
      }
      setIsRemovedBollingerBand(true)
    }
  }, [candleStickChart, settingsToolContext?.showingBollingerBand, props.candleStickData, settingsToolContext?.timeFrame, settingsToolContext?.bollingerBand])

  useEffect(() => {
    console.log("testing~isDrawingFibo", settingsToolContext?.isDrawingFibo )
    if (candleStickChart && isDrawingLine) {

      if (startingPoint && clickPoint) {
        setStartingPoint(null)
        setIsDrawingLine(false)
        try {
          drawFiboRetracement(candleStickChart, startingPoint, clickPoint)
        } catch (error) {
          console.error("wrong click")
        }
      }
      else if (clickPoint) {
        setStartingPoint(clickPoint);
      }
    }
  }, [clickPoint, candleStickChart])

  const drawFiboRetracement = (chart: IChartApi, startP:  {
    time: Time;
    value: number;
}, currentP:  {
  time: Time;
  value: number;
}) => {
    const fibbonaciRetracementSeries_1 = chart.addLineSeries({
      color: 'rgba(0, 128, 255, 1)',   // Line color separating the area
      lineWidth: 2,
    });

    const fibbonaciRetracementSeries_2 = chart.addLineSeries({
      color: 'rgba(89, 245, 39, 0.8)',   // Line color separating the area
      lineWidth: 2,
    });

    const fibbonaciRetracementSeries_3 = chart.addLineSeries({
      color: 'rgba(245, 39, 93, 0.8)',   // Line color separating the area
      lineWidth: 2,
    });

    const fibbonaciRetracementSeries_4 = chart.addLineSeries({
      color: 'rgba(0, 128, 255, 1)',   // Line color separating the area
      lineWidth: 2,
    });

    const fibbonaciRetracementSeries_5 = chart.addLineSeries({
      color: 'rgba(226, 245, 39, 0.8)',   // Line color separating the area
      lineWidth: 2,
    });

    const fibbonaciRetracementSeries_6 = chart.addLineSeries({
      color: 'rgba(49, 39, 245, 0.8)',   // Line color separating the area
      lineWidth: 2,
    });

    const fibLevels = calculateFibonacciLevels(Math.max(startP?.value, currentP.value), Math.min(startP?.value, currentP.value));
    fibbonaciRetracementSeries_1.setData([
      {
        time: startP.time, value: fibLevels['0%']
      },
      {
        time: currentP?.time, value: fibLevels['0%']
      },
    ])
    fibbonaciRetracementSeries_2.setData([
      {
        time: startP.time, value: fibLevels['100%']
      },
      {
        time: currentP?.time, value: fibLevels['100%']
      },
    ])
    fibbonaciRetracementSeries_3.setData([
      {
        time: startP.time, value: fibLevels['23.6%']
      },
      {
        time: currentP?.time, value: fibLevels['23.6%']
      },
    ])
    fibbonaciRetracementSeries_4.setData([
      {
        time: startP.time, value: fibLevels['38.2%']
      },
      {
        time: currentP?.time, value: fibLevels['38.2%']
      },
    ])
    fibbonaciRetracementSeries_5.setData([
      {
        time: startP.time, value: fibLevels['50%']
      },
      {
        time: currentP?.time, value: fibLevels['50%']
      },
    ])
    fibbonaciRetracementSeries_6.setData([
      {
        time: startP.time, value: fibLevels['61.8%']
      },
      {
        time: currentP?.time, value: fibLevels['61.8%']
      },
    ])
  }

  return (
    <Box className='flex flex-col items-center justify-center'>
      <Box ref={chartContainerRef} />
    </Box>
  );
};

export default DisplayChart;
