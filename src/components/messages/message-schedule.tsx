import styles from "@/styles/Inbox.module.css";
import { MessageScheduleProps } from "@/types/props-types/message-schedule.props.type";
import { ChevronDownIcon, CloseIcon } from "@chakra-ui/icons";
import { Flex, RadioGroup, Radio, Text, Button, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import MessageScheduleCustom from "./message-schedule-custom";
import { useEffect, useState } from "react";

dayjs.extend(utc)
dayjs.extend(timezone)

export default function MessageSchedule({ date, onChange }: MessageScheduleProps) {
  const [isOpen, setOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState(date)
  const [customSchedule, setCustomSchedule] = useState(false)
  const dateFormat = 'YYYY-MM-DD HH:mm:ss'
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
    setScheduleDate(date)
  }, [date])

  return (
    <Menu isLazy={true} lazyBehavior={"keepMounted"} isOpen={isOpen} onClose={() => setOpen(false)}>
      <MenuButton
        onClick={() =>  setOpen(!isOpen)}
        className={styles.replyArrowIcon} as={Button}
        aria-label='Options'
        variant='outline'>
        <ChevronDownIcon />
      </MenuButton>
      <MenuList zIndex={'dropdown'} width={'360px'}>
        {!customSchedule && (
          <>
            <Flex
              padding={'7px 12px 12px'} align={'center'}
              justifyContent={'space-between'} borderBottom={'1px solid #F3F4F6'}
            >
              <Text
                fontSize='13px' color={'#374151'} letterSpacing={'-0.13px'} lineHeight={'normal'}>Schedule send ({dayjs.tz.guess()})</Text>
              <Button
                onClick={() => setOpen(false)}
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
                onChange={(e) => {
                  onChange(dayjs(e).format())
                  setOpen(false)
                }}
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
                onClick={() => setOpen(false)}
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
                onChange={(scheduledDate: string) => {
                  onChange(scheduledDate)
                  setOpen(false)
                }}
                onCancel={() => {
                  setOpen(false)
                  setTimeout(() => {
                    setCustomSchedule(false)  
                  }, 500)
                }}
              />
            </Flex>
          </>
        )}
      </MenuList>
    </Menu>
  )
}