import styles from "@/styles/Inbox.module.css";
import { MessageScheduleProps } from "@/types/props-types/message-schedule.props.type";
import { ChevronDownIcon, CloseIcon } from "@chakra-ui/icons";
import { Flex, RadioGroup, Radio, Text, Button, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
const MessageScheduleCustom = dynamic(() => import("./message-schedule-custom").then(mod => mod.default));
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StateType } from "@/types";
import { useSelector } from "react-redux";
import {TimeSnoozeIcon} from "@/icons";

dayjs.extend(utc)
dayjs.extend(timezone)

export default function MessageSchedule({ date, onChange, isSnooze = false, isNameShow = false }: MessageScheduleProps) {
  const [isOpen, setOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState(date)
  const [customSchedule, setCustomSchedule] = useState(false)
  const [showScheduleMenu, setShowScheduleMenu] = useState(false)
  const { event: incomingEvent } = useSelector((state: StateType) => state.globalEvents);
  const dateFormat = 'YYYY-MM-D HH:mm:ss'

  const quickOptions = [
    {
      label: 'Tomorrow morning',
      value: dayjs().add(1, 'day').hour(8).minute(0).second(0)
    },
    {
      label: 'Tomorrow afternoon',
      value: dayjs().add(1, 'day').hour(13).minute(0).second(0)
    },
    {
      label: 'Monday morning',
      value: dayjs().startOf('week').hour(8).minute(0).second(0).add(8, 'day')
    }
  ]

  useEffect(() => {
    if (date) {
      setScheduleDate(date)
    }
  }, [date])

  useEffect(() => {
    if (isSnooze) {
      setShowScheduleMenu(true);
    }
  }, [isSnooze])

  const closeScheduleDropdown = () => {
    setOpen(false)
    setShowScheduleMenu(isSnooze)
    setCustomSchedule(false)
  }

  const onSetValue = (scheduledDate: string) => {
    closeScheduleDropdown()
    onChange(scheduledDate)
  }

  useEffect(() => {
    if(incomingEvent === 'iframe.clicked') {
      closeScheduleDropdown()
    }
  }, [incomingEvent]);

  return (
    <Menu
      isLazy={true}
      lazyBehavior={"keepMounted"}
      isOpen={isOpen}
      onClose={() => closeScheduleDropdown}
      closeOnSelect={false} placement={'bottom'}
      >
      <MenuButton
        onClick={() => {
          const opened = isOpen
          setOpen(!opened)
          if (opened) {
            setShowScheduleMenu(false)
            if (!scheduleDate) {
              setCustomSchedule(false)
            }
          }
        }}
        className={`${styles.replyArrowIcon} snooze-button-icon`} as={isSnooze ? "div" : Button}
        aria-label='Options'
        {...(!isSnooze ? {variant: 'outline'} : {})}
      >
          {isSnooze ? <TimeSnoozeIcon/> : <ChevronDownIcon />}
        {isNameShow && 'Snooze'}
      </MenuButton>

      {!showScheduleMenu && (
        <MenuList className={'drop-down-list'}>
          {!scheduleDate && (
            <MenuItem
              onClick={() => {
                setShowScheduleMenu(true)
              }}
            >
              Send Later
            </MenuItem>
          )}

          {scheduleDate && (
            <>
              <MenuItem
                onClick={() => {
                  onChange(undefined)
                  setScheduleDate(undefined)
                  closeScheduleDropdown()
                }}
              >
                Clear
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setShowScheduleMenu(true)
                }}
              >
                Change Time/Day
              </MenuItem>
            </>
          )}
        </MenuList>
      )}

      {showScheduleMenu && (
        <MenuList zIndex={'dropdown'} width={'360px'}>
          {!customSchedule && (
            <>
              <Flex
                padding={'7px 12px 12px'} align={'center'}
                justifyContent={'space-between'} borderBottom={'1px solid #F3F4F6'}
              >
                <Text
                  fontSize='13px' color={'#374151'} letterSpacing={'-0.13px'} lineHeight={'normal'}>
                  {isSnooze ? 'Snooze' : 'Schedule send'} ({dayjs.tz.guess()})
                </Text>
                <Button
                  onClick={closeScheduleDropdown}
                  h={'20px'} minW={'20px'}
                  className={styles.dropDownCloseIcon}
                  backgroundColor={'transparent'} padding={0}
                  color={'#6B7280'} colorScheme='blue'>
                  <CloseIcon />
                </Button>
              </Flex>

              <Flex
                mt={4} direction={'column'} gap={4} px={3}
                className={'radio-group-button'}
              >
                <RadioGroup
                  onChange={(e) => onSetValue(dayjs(e).format())}
                  value={dayjs(scheduleDate)?.format(dateFormat)}
                >
                  {quickOptions.map((option, index) => (
                    <Radio
                      key={index}
                      value={option.value.format(dateFormat)}
                      size={'sm'}
                      paddingTop={1.5}
                      paddingBottom={1.5}
                    >
                      {option.label} {' '}
                      <span style={{ color: '#9CA3AF', fontSize: '13px' }}>({option.value.format('MMM DD, h:mmA')})</span>
                    </Radio>
                  ))}
                </RadioGroup>
              </Flex>

              <Flex
                mt={4} direction={'column'} gap={4} px={3}
                className={'radio-group-button'}
              >
                <Flex w={'100%'} pt={4} pb={3} borderTop={'1px solid #F3F4F6'}>
                  <Button
                    onClick={() => setCustomSchedule(true)}
                    className={'custom-time-date'}
                    border={'1px solid #374151'}
                    lineHeight={1} borderRadius={8} color={'#374151'}
                    h={'auto'}
                    backgroundColor={'#FFFFFF'} fontSize={'14px'}
                    padding={'10px 12px'}
                  >
                    Custom time & date
                  </Button>
                </Flex>
              </Flex>
            </>
          )}

          {customSchedule && (
            <>
              <Flex
                padding={'7px 12px 12px'} align={'center'}
                justifyContent={'space-between'} borderBottom={'1px solid #F3F4F6'}
              >
                <Text
                  fontSize='13px' color={'#374151'}
                  letterSpacing={'-0.13px'} lineHeight={'normal'}
                >
                  Custom time & date
                </Text>
                <Button
                  onClick={closeScheduleDropdown}
                  h={'20px'} minW={'20px'}
                  className={styles.dropDownCloseIcon}
                  backgroundColor={'transparent'} padding={0}
                  color={'#6B7280'} colorScheme='blue'>
                  <CloseIcon />
                </Button>
              </Flex>

              <Flex
                mt={4} direction={'column'} gap={4} px={0}
                className={'radio-group-button'}
              >
                <MessageScheduleCustom
                  date={scheduleDate}
                  onChange={onSetValue}
                  onCancel={() => closeScheduleDropdown()}
                />
              </Flex>
            </>
          )}
        </MenuList>
      )}
    </Menu>
  )
}
