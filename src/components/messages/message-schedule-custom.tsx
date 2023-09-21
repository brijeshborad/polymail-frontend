import { useState } from "react";
import { Toaster } from "@/components/common";
import { Menu, MenuButton, MenuList, Flex, Button, Grid, GridItem, Input, Text, MenuItem, InputGroup, InputLeftElement, SimpleGrid } from "@chakra-ui/react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { MessageScheduleCustomProps } from "@/types/props-types/message-schedule-custom.props.type";
import { timezoneList } from "@/utils/timezones";
import { ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import React from "react";
const TimePicker = dynamic(() => import("../common/time-picker").then(mod => mod.default));
import { TimePickerScheduledDateProps } from "@/types/props-types/time-picker.props.type";
import dynamic from "next/dynamic";

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)

export default function MessageScheduleCustom({ date, onChange, onCancel }: MessageScheduleCustomProps) {
  const [timezoneSearch, setTimezoneSearch] = useState<string>('')
  const currentDate = date ? dayjs(date) : (dayjs().add(1, 'hour').minute(0))
  const guessedTimezone = dayjs.tz.guess()
  const [scheduleDate, setScheduledDate] = useState<TimePickerScheduledDateProps>({
    time: {
      hour: currentDate.format('hh'),
      minute: currentDate.format('mm')
    },
    amPm: currentDate.format('A'),
    timezone: guessedTimezone,
    month: currentDate.format('MMM'),
    day: currentDate.format('D'),
    year: currentDate.year()
  })
  const today = dayjs()
  const yearOptions = [today.year(), today.add(1, 'year').year()]
  const monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentTimezone = timezoneList.find(tl => tl.utc.includes(scheduleDate.timezone))?.value || guessedTimezone
  let daysArray: number[] = []
  for (let i = 1; i <= 31; i++) daysArray.push(i)

  const handleChange = (value: any, field: string) => {
    setScheduledDate({
      ...scheduleDate,
      [field]: value
    })
  }

  const handleUpdate = () => {
    const { year, day } = scheduleDate

    if (parseInt(day) < 1) {
      Toaster({ desc: 'Please enter a valid day', title: 'Day can\'t be lower than 1', type: 'error' })
      return
    }

    if (parseInt(day) > 31) {
      Toaster({ desc: 'Please enter a valid day', title: 'Day can\'t be higher than 31', type: 'error' })
      return
    }

    const currentYear = today.year()
    if (year < currentYear) {
      Toaster({ desc: 'Please enter a valid year', title: 'You can\'t schedule on a past date', type: 'error' })
      return
    }

    let outputScheduledDate;
    try {
      outputScheduledDate = buildDate()

      if(outputScheduledDate.isBefore(today)) {
        Toaster({ desc: 'Please enter a valid date', title: 'You can\'t schedule on a past date', type: 'error' })
        return
      }

      onChange(outputScheduledDate.format())
    } catch (e) {
      Toaster({ desc: 'Please enter a valid date', title: 'Invalid date', type: 'error' })
    }
  }

  const buildDate = () => {
    return dayjs(
      `${scheduleDate.year}-${scheduleDate.month}-${scheduleDate.day} ${scheduleDate.time.hour}:${scheduleDate.time.minute}:00 ${scheduleDate.amPm}`,
      'YYYY-MMM-D hh:mm:ss A'
    )
  }

  const showDate = () => {
    let abbrivation = timezoneList.find(tl => tl.utc.includes(scheduleDate.timezone))?.abbr;
    let date = dayjs(
        `${scheduleDate.year}-${scheduleDate.month}-${scheduleDate.day} ${scheduleDate.time.hour}:${scheduleDate.time.minute}:00 ${scheduleDate.amPm}`,
    );
    if (abbrivation) {
      return date.format('D/MM/YYYY hh:mm A') + ' ' + abbrivation
    } else {
      return date.tz(scheduleDate.timezone).format('D/MM/YYYY hh:mm A z');
    }
  }

  const filteredTimezoneList = timezoneSearch.length ? (
    timezoneList.filter(tl => tl.value.search(timezoneSearch) !== -1)
  ) : timezoneList

  return (
    <Flex direction={'column'} className={'custom-time'}>
      <Flex direction={'column'} gap={4} px={3}
        className={'radio-group-button'}>
        <Flex direction={'column'}
          className={'custom-time'}>
          <Text fontSize={'13px'} fontWeight={500}
            mb={2}
            color={'#0A101D'}
            letterSpacing={'-0.13px'}
            lineHeight={'normal'}>Time</Text>

          <Grid templateColumns='repeat(3, 1fr)'
            gap={3}>
            <GridItem w='100%'>
              <TimePicker
                scheduledDate={scheduleDate}
                onChange={(date) => {
                  handleChange({
                    hour: date.time.hour,
                    minute: date.time.minute
                  }, 'time')
                }}
              />
            </GridItem>
            <GridItem w='100%'>
              <Menu closeOnSelect={true}>
                <MenuButton
                  fontSize={'12px'}
                  color={'#374151'} w={'full'}
                  backgroundColor={'#FFFFFF'} h={'auto'} p={'11px 4px 10px 4px'}
                  border={'1px solid #E5E7EB'} borderRadius={'8px'}
                  as={Button}
                  rightIcon={<ChevronDownIcon style={{ color: '#374151' }} />}>
                  {scheduleDate.amPm}
                </MenuButton>
                <MenuList className={`drop-down-list`} zIndex={'overlay'}>
                  <MenuItem
                    onClick={() => handleChange('AM', 'amPm')}
                    backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                    justifyContent={'flex-start'}
                  >
                    AM
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleChange('PM', 'amPm')}
                    backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                    justifyContent={'flex-start'}
                  >
                    PM
                  </MenuItem>
                </MenuList>
              </Menu>
            </GridItem>
            <GridItem w='100%'>

              <Menu closeOnSelect={true} closeOnBlur={true} flip={false}>
                <MenuButton
                  fontSize={'12px'}
                  color={'#374151'} w={'full'}
                  backgroundColor={'#FFFFFF'} h={'auto'} p={'11px 4px 10px 4px'}
                  border={'1px solid #E5E7EB'} borderRadius={'8px'}
                  as={Button}
                  rightIcon={<ChevronDownIcon style={{ color: '#374151' }} />}
                >
                  {currentTimezone.length < 12 ? currentTimezone : (currentTimezone.substring(0, 9) + '...')}
                </MenuButton>
                <MenuList className={`drop-down-list`} zIndex={'overlay'}>
                  <div className={'dropdown-searchbar'}>
                    <InputGroup>
                      <InputLeftElement h={'27px'} pointerEvents='none'>
                        <SearchIcon />
                      </InputLeftElement>
                      <Input
                        placeholder='Search timezone'
                        value={timezoneSearch}
                        onChange={(e) => setTimezoneSearch(e.target.value)}
                      />
                    </InputGroup>
                  </div>

                  {filteredTimezoneList.slice(0, 5).map((tz, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleChange(tz.utc[0], 'timezone')}
                      backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                      justifyContent={'flex-start'}
                    >
                      {tz.value}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </GridItem>
          </Grid>
        </Flex>

        <Flex direction={'column'}
          className={'custom-time'}>
          <Text fontSize={'13px'} fontWeight={500}
            mb={2}
            color={'#0A101D'}
            letterSpacing={'-0.13px'}
            lineHeight={'normal'}>Date</Text>

          <Grid templateColumns='repeat(3, 1fr)'
            gap={3}>
            <GridItem w='100%'>
              <Menu closeOnSelect={true}>
                <MenuButton
                  fontSize={'12px'}
                  color={'#374151'} w={'full'}
                  backgroundColor={'#FFFFFF'} h={'auto'} p={'11px 4px 10px 4px'}
                  border={'1px solid #E5E7EB'} borderRadius={'8px'}
                  as={Button}
                  rightIcon={<ChevronDownIcon style={{ color: '#374151' }} />}>
                  {scheduleDate.month}
                </MenuButton>
                <MenuList className={`drop-down-list month-dropdown`} zIndex={'overlay'}>
                  <div className={'month-dropdown-scrollbar'}>
                    {monthArray && monthArray.map((month: string, index: number) => {
                      const currentDate = dayjs(`${scheduleDate.year}-${month}-${scheduleDate.day}`, 'YYYY-MMM-D')
                      const isPastDate = today.isAfter(currentDate, 'day')
                      return (
                          <MenuItem
                              key={index}
                              onClick={() => handleChange(month, 'month')}
                              backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                              justifyContent={'flex-start'}
                              isDisabled={isPastDate}
                          >
                            {month}
                          </MenuItem>
                      )
                    })}
                  </div>
                </MenuList>
              </Menu>
            </GridItem>
            <GridItem w='100%'>
              <Menu closeOnSelect={true}>
                <MenuButton
                  fontSize={'12px'}
                  color={'#374151'} w={'full'}
                  backgroundColor={'#FFFFFF'} h={'auto'} p={'11px 4px 10px 4px'}
                  border={'1px solid #E5E7EB'} borderRadius={'8px'}
                  as={Button}
                  rightIcon={<ChevronDownIcon style={{ color: '#374151' }} />}>
                  {scheduleDate.day}
                </MenuButton>
                <MenuList className={`drop-down-list grid`} zIndex={'overlay'}>
                  <SimpleGrid columns={6} spacing={1} padding={4}>
                    {daysArray.map(day => {
                      const currentDate = dayjs(`${scheduleDate.year}-${scheduleDate.month}-${day}`, 'YYYY-MMM-D')
                      const isPastDate = today.isAfter(currentDate, 'day')
                      return (
                        <MenuItem
                          key={day}
                          onClick={() => handleChange(day, 'day')}
                          backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                          justifyContent={'flex-start'}
                          isDisabled={isPastDate}
                        >
                          {day}
                        </MenuItem>
                      )
                    })}
                  </SimpleGrid>
                </MenuList>
              </Menu>
            </GridItem>
            <GridItem w='100%'>
              <Menu closeOnSelect={true}>
                <MenuButton
                  fontSize={'12px'}
                  color={'#374151'} w={'full'}
                  backgroundColor={'#FFFFFF'} h={'auto'} p={'11px 4px 10px 4px'}
                  border={'1px solid #E5E7EB'} borderRadius={'8px'}
                  as={Button}
                  rightIcon={<ChevronDownIcon style={{ color: '#374151' }} />}
                >
                  {scheduleDate.year}
                </MenuButton>
                <MenuList className={`drop-down-list`} zIndex={'overlay'}>
                  {yearOptions.map(year => {
                    const currentDate = dayjs(`${year}-${scheduleDate.month}-${scheduleDate.day}`, 'YYYY-MMM-D')
                    const isPastDate = today.isAfter(currentDate, 'day')
                    return (
                      <MenuItem
                        key={year}
                        onClick={() => handleChange(year, 'year')}
                        backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                        justifyContent={'flex-start'}
                        isDisabled={isPastDate}
                      >
                        {year}
                      </MenuItem>
                    )
                  })}
                </MenuList>
              </Menu>
            </GridItem>
          </Grid>
          <Text fontSize={'xs'} marginTop={'10px'} float={'right'}>{showDate()}</Text>
        </Flex>

        <Flex w={'100%'} pt={4} pb={0} gap={3}
          justify={'flex-end'}
          borderTop={'1px solid #F3F4F6'}>
          <Button
            onClick={() => onCancel()}
            className={'custom-time-date'}
            border={'1px solid #374151'}
            lineHeight={1} borderRadius={8}
            color={'#374151'} h={'auto'}
            backgroundColor={'#FFFFFF'}
            fontSize={'14px'}
            padding={'10px 12px'}
          >
            Cancel
          </Button>

          <Button
            onClick={() => {
              handleUpdate()
            }}
            className={'schedule-button'}
            border={'1px solid #374151'}
            lineHeight={1} borderRadius={8}
            color={'#FFFFFF'} h={'auto'}
            backgroundColor={'#1F2937'}
            fontSize={'14px'}
            padding={'10px 12px'}
          >
            Schedule
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}
