"use client"
import Head from 'next/head'
import CandleStickChart from './components/CandleStickChart';
import { Box, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Tooltip } from '@mui/material'
import HandymanIcon from '@mui/icons-material/Handyman';
import { createContext, Dispatch, SetStateAction, useState } from 'react';
import ToolsModal from './components/ToolsModal';
import { Time } from 'lightweight-charts';

export type SettingsOption = 'bollinger-bands' | 'fibonacci-retracement';

export interface IBollingerBand {
  period: number;
  stdDeviation: number
}

export interface IKlineData {
  open: number,
  high: number,
  low: number,
  close: number,
  time: Time,
  volume: number
}

// Define the shape of the context
interface ISettingsToolContext {
  bollingerBand: IBollingerBand;
  setBollingerBand: Dispatch<SetStateAction<IBollingerBand>>;
  timeFrame: Timeframe;
  setTimeFrame: Dispatch<SetStateAction<Timeframe>>,
  selectedChartType: ChartType
  setSelectedChartType: Dispatch<SetStateAction<ChartType>>,
  setShowingBollingerBand: Dispatch<SetStateAction<boolean>>,
  showingBollingerBand: boolean,
  isDrawingFibo: boolean,
  setIsDrawingFibo: Dispatch<SetStateAction<boolean>>
  showVolumeGraph: boolean,
  setShowVolumeGraph: Dispatch<SetStateAction<boolean>>,
  showDeleteFib: boolean,
  setShowDeleteFibo: Dispatch<SetStateAction<boolean>>
}

export type Timeframe = '1m' | '5m' | '1h' | '1d' | '1M';

const timeframeOptions = [{
  label: "1 minute",
  value: "1m"
}, {
  label: "5 minutes",
  value: "5m"
}, {
  label: "1 hour",
  value: "1h"
},{
  label: "1 day",
  value: "1d"
},{
  label: "1 month",
  value: "1M"
}]

export type ChartType = 'historical' | 'realtime';

// Create the context with default values
export const SettingsToolContext = createContext<ISettingsToolContext | undefined>(undefined);

export default function Home() {
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [currentSettingsOption, setCurrentSettingsOption] = useState<SettingsOption>("bollinger-bands");
  const [bollingerBandConfig, setBollingerBandConfig] = useState<IBollingerBand>({
    period: 10,
    stdDeviation: 5
  })
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('realtime');
  const [showingBollingerBand, setShowingBollingerBand] = useState<boolean>(false);
  const [isDrawingFibo, setIsDrawingFibo] = useState<boolean>(false);
  const [showDeleteFib, setShowDeleteFibo] = useState<boolean>(false);
  const [showVolumeGraph, setShowVolumeGraph] = useState<boolean>(false);
  const [timeFrame, setTimeFrame] = useState<Timeframe>('1m')

  const openSettingsModel = () => {
    setShowSettingsModal(true);
  }

  const closeSettingsModel = () => {
    setShowSettingsModal(false);
  }

  return (
    <SettingsToolContext.Provider value={{
      bollingerBand: bollingerBandConfig,
      setBollingerBand: setBollingerBandConfig,
      timeFrame: timeFrame,
      setTimeFrame: setTimeFrame,
      selectedChartType: selectedChartType,
      setSelectedChartType: setSelectedChartType,
      showingBollingerBand: showingBollingerBand,
      setShowingBollingerBand: setShowingBollingerBand,
      isDrawingFibo, setIsDrawingFibo, showDeleteFib, setShowDeleteFibo, showVolumeGraph, setShowVolumeGraph }}>
      <div>
        <Head>
          <title>BTC-USD Chart</title>
          <meta name="description" content="BTC-USD price chart using Next.js and Binance API" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className='absolute top-0 bottom-0 left-0 right-0 flex flex-col p-5'>
          <h1>BTC-USD Price Chart</h1>
          <CandleStickChart />
          <Box className='mx-auto p-2 bg-white rounded-lg shadow-lg flex flex-row items-center justify-center gap-5 flex-wrap'>
            <Tooltip title='Trading Tools'>
              <IconButton onClick={() => {
                openSettingsModel()
              }}>
                <HandymanIcon />
              </IconButton>
            </Tooltip>
            <Box className='flex flex-row items-center justify-center gap-4 flex-wrap'>
              <Box className='flex flex-row gap-4 flex-wrap'>
              {
                timeframeOptions.map((option) => {
                  return (
                    <Box className={`${option.value === timeFrame&&"bg-gray-300 text-white"} text-gray-800 flex flex-row px-3 py-1 rounded-sm cursor-pointer`}
                    onClick={() => {
                      setTimeFrame(option.value as Timeframe)
                    }}
                    >
                      {
                        option.label
                      }
                    </Box>
                  )
                })
              }
              </Box>
              <Box
              onClick = {() => {
                setShowingBollingerBand(prevState => !prevState)
              }}
               className={`${showingBollingerBand&&"bg-gray-300 text-white"} text-gray-800 flex flex-row px-3 py-1 rounded-sm cursor-pointer`}>
                Show Bollinger Band
              </Box>
              <Box 
              onClick = {() => {
                setIsDrawingFibo(prevState => !prevState)
              }}
              className={`${isDrawingFibo&&"bg-gray-300 text-white"} text-gray-800 flex flex-row px-3 py-1 rounded-sm cursor-pointer`}>
                {
                  showDeleteFib?
                 "Delete Fibonacci Retracement": "Draw Fibonacci Retracement"}
              </Box>
              <Box
              onClick = {() => {
                setShowVolumeGraph(prevState => !prevState)
              }} 
              className={`${showVolumeGraph&&"bg-gray-300 text-white"} text-gray-800 flex flex-row px-3 py-1 rounded-sm cursor-pointer`}>
                Show Volume Graph
              </Box>
            </Box>
          </Box>
          {
            showSettingsModal &&
            <ToolsModal
              open={showSettingsModal}
              handleClose={closeSettingsModel}
              currentSettingsOption={currentSettingsOption}
              setCurrentSettingsOption={setCurrentSettingsOption}
            />
          }
        </main>
      </div>
    </SettingsToolContext.Provider>
  )
}