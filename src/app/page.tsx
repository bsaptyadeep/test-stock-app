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
          <Box className='max-w-sm mx-auto p-2 bg-white rounded-lg shadow-lg flex flex-row items-center justify-center gap-5'>
            <Tooltip title='Trading Tools'>
              <IconButton onClick={() => {
                openSettingsModel()
              }}>
                <HandymanIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Interval'>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Age</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={timeFrame}
                  label="Timeframe"
                  onChange={(event: SelectChangeEvent) => {
                    setTimeFrame(event.target.value as string as Timeframe)
                  }}
                >
                  <MenuItem value={'1m'}>1 minute</MenuItem>
                  <MenuItem value={'5m'}>5 minutes</MenuItem>
                  <MenuItem value={'1h'}>1 hour</MenuItem>
                  <MenuItem value={'1d'}>1 day</MenuItem>
                  <MenuItem value={'1M'}>1 month</MenuItem>
                </Select>
              </FormControl>
              </Tooltip>
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