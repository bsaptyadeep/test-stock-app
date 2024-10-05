import { Box, Button, Dialog, DialogContent, DialogTitle, TextField } from '@mui/material'
import React, { Dispatch, SetStateAction, useContext } from 'react'
import { IBollingerBand, SettingsOption, SettingsToolContext } from '../page'

interface IProps {
    open: boolean,
    handleClose: () => void,
    currentSettingsOption: SettingsOption,
    setCurrentSettingsOption: Dispatch<SetStateAction<SettingsOption>>,
}

const ToolsModal = (props: IProps) => {
    const settingsToolContext = useContext(SettingsToolContext);

    if(!settingsToolContext) {
        return <></>
    }

    return (
        <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Trading Tool"}
            </DialogTitle>
            <DialogContent className='py-10 flex flex-col gap-9'>
                <Box className="gap-5 flex flex-row">
                    <Button
                        onClick={() => {
                            props.setCurrentSettingsOption("bollinger-bands")
                        }}
                        variant={props.currentSettingsOption === "bollinger-bands" ? 'contained' : 'outlined'}>
                        <p>
                            Bollinger Band
                        </p>
                    </Button>
                    <Button
                        onClick={() => {
                            props.setCurrentSettingsOption("fibonacci-retracement")
                        }}
                        variant={props.currentSettingsOption === "fibonacci-retracement" ? 'contained' : 'outlined'}>
                        <p>
                            Fibonacci Retracement
                        </p>
                    </Button>
                </Box>
                {
                    props.currentSettingsOption === "bollinger-bands" ?
                        <Box className='flex flex-col gap-5'>
                            <TextField 
                            id="outlined-period" 
                            label="Period" 
                            value={settingsToolContext.bollingerBand.period}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                settingsToolContext.setBollingerBand((prevState: any) => {
                                    return {
                                        ...prevState,
                                        period: Number(event.target.value)
                                    }
                                })
                            }}
                            type='number'
                            variant="outlined" />
                            <TextField 
                            id="outlined-standard-deviation" 
                            label="Standard Deviation" 
                            value={settingsToolContext.bollingerBand.stdDeviation}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                settingsToolContext.setBollingerBand((prevState: any) => {
                                    return {
                                        ...prevState,
                                        stdDeviation: Number(event.target.value)
                                    }
                                })
                            }}
                            type='number'
                            variant="outlined" />
                        </Box> :
                        <Box className='flex flex-col gap-5'>
                        <TextField 
                        id="outlined-period" 
                        label="Period" 
                        value={settingsToolContext.bollingerBand.period}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            settingsToolContext.setBollingerBand((prevState: any) => {
                                return {
                                    ...prevState,
                                    period: Number(event.target.value)
                                }
                            })
                        }}
                        type='number'
                        variant="outlined" />
                        <TextField 
                        id="outlined-standard-deviation" 
                        label="Standard Deviation" 
                        value={settingsToolContext.bollingerBand.stdDeviation}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            settingsToolContext.setBollingerBand((prevState: any) => {
                                return {
                                    ...prevState,
                                    stdDeviation: Number(event.target.value)
                                }
                            })
                        }}
                        type='number'
                        variant="outlined" />
                    </Box>
                }
            </DialogContent>
        </Dialog>
    )
}

export default ToolsModal
