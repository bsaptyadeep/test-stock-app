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
  setSelectedChartType: Dispatch<SetStateAction<ChartType>>
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
      setSelectedChartType: setSelectedChartType }}>
      <div>
        <Head>
          <title>BTC-USD Chart</title>
          <meta name="description" content="BTC-USD price chart using Next.js and Binance API" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className='absolute top-0 bottom-0 left-0 right-0 flex flex-col p-5'>
          <h1>BTC-USD Price Chart</h1>
          <CandleStickChart />
          <Box className='mx-auto p-2 bg-white rounded-lg shadow-lg flex flex-row items-center justify-center gap-5'>
            <Tooltip title='Trading Tools'>
              <IconButton onClick={() => {
                openSettingsModel()
              }}>
                <HandymanIcon />
              </IconButton>
            </Tooltip>
            <Box className='flex flex-row items-center justify-center gap-4 flex-wrap'>
              <Box className='flex flex-row gap-4'>
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
              <Box>
                Show Bollinger Band
              </Box>
              <Box>
                Draw Fibonacci Retracement
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