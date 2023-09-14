import { ChangeEvent, useState } from "react";
import { CloseIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, MenuList, Flex, Button, Grid, GridItem, Input, Select, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { MessageScheduleCustomProps } from "@/types/props-types/message-schedule-custom.props.type";
import { timezoneList } from "@/utils/timezones";

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

export default function MessageScheduleCustom({ date, onChange }: MessageScheduleCustomProps) {
  const currentDate = dayjs(date) ?? dayjs()
  const [isOpen, setOpen] = useState(false)
  const [scheduleDate, setScheduledDate] = useState({
    time: currentDate.minute(0).format('hh:mm'),
    amPm: currentDate.format('A'),
    timezone: dayjs.tz.guess(),
    month: currentDate.format('MMM'),
    day: currentDate.format('DD'),
    year: currentDate.format('YYYY')
  })


  const monthArray = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
    setScheduledDate({
      ...scheduleDate,
      [field]: e.target.value
    })
  }

  const handleUpdate = () => {
    const { year, month, day, time, amPm, timezone } = scheduleDate

    const outputScheduledDate = dayjs.tz(
      `${year}-${month}-${day} ${time}:00 ${amPm}`,
      'YYYY-MMM-DD hh:mm:ss A',
      timezone
    )

    return onChange(outputScheduledDate.format())
  }

  return (
    <Menu isOpen={isOpen} onClose={() => setOpen(false)}>
      <MenuButton
        onClick={() => setOpen(true)}
        className={'custom-time-date'}
        border={'1px solid #374151'}
        lineHeight={1} borderRadius={8} color={'#374151'}
        h={'auto'}
        backgroundColor={'#FFFFFF'} fontSize={'14px'}
        padding={'10px 12px'}
      >
        Custom time & date
      </MenuButton>
      <MenuList className={'custom-dropdown'} width={'360px'}>
        <Flex
          padding={'12px 12px 11px'} align={'center'}
          justifyContent={'space-between'}
          borderBottom={'1px solid #F3F4F6'}
        >
          <Text
            fontSize='13px'
            color={'#374151'}
            letterSpacing={'-0.13px'}
            lineHeight={'normal'}
          >
            Custom time & date
          </Text>
          <Button
            onClick={() => setOpen(false)}
            h={'20px'} minW={'20px'}
            className={'dropdown-close-icon'}
            backgroundColor={'transparent'}
            padding={0} color={'#6B7280'}
            colorScheme='blue'>
            <CloseIcon />
          </Button>
        </Flex>

        <Flex mt={4} direction={'column'} gap={4} px={3}
          className={'radio-group-button'}>
          <Flex direction={'column'} className={'custom-time'}>
            <Flex mt={4} direction={'column'} gap={4} px={3}
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
                    <Input
                      type='time'
                      value={scheduleDate.time}
                      onChange={(e) => handleChange(e, 'time')}
                      onBlur={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleChange(e, 'time')
                      }}
                      border={'1px solid #E5E7EB'}
                      fontSize={'13px'}
                      fontWeight={400}
                      lineHeight={1}
                      padding={'10px 16px'}
                      h={'auto'}
                      backgroundColor={'#FFFFFF'}
                      borderRadius={8}
                      placeholder='1:30' />
                  </GridItem>
                  <GridItem w='100%'>
                    <Select
                      value={scheduleDate.amPm}
                      onChange={(e) => handleChange(e, 'amPm')}
                      border={'1px solid #E5E7EB'}
                      fontSize={'13px'}
                      fontWeight={400}
                      lineHeight={1} h={'auto'}
                      backgroundColor={'#FFFFFF'}
                      borderRadius={8}
                    >
                      <option value='AM'>AM</option>
                      <option value='PM'>PM</option>
                    </Select>
                  </GridItem>
                  <GridItem w='100%'>
                    <Select
                      value={scheduleDate.timezone}
                      onChange={(e) => handleChange(e, 'timezone')}
                      border={'1px solid #E5E7EB'}
                      fontSize={'13px'}
                      fontWeight={400}
                      lineHeight={1} h={'auto'}
                      backgroundColor={'#FFFFFF'}
                      borderRadius={8}
                    >
                      {timezoneList.map((tz, index) => (
                        <option
                          key={index}
                          value={tz.utc[0]}
                        >
                          {tz.value}
                        </option>
                      ))}
                    </Select>
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
                    <Select
                      value={scheduleDate.month}
                      onChange={(e) => handleChange(e, 'month')}
                      border={'1px solid #E5E7EB'}
                      fontSize={'13px'}
                      fontWeight={400}
                      lineHeight={1} h={'auto'}
                      backgroundColor={'#FFFFFF'}
                      borderRadius={8}
                    >
                      {monthArray && monthArray.map((item: string, index: number) => (
                        <option value={item}
                          key={index}>{item}
                        </option>
                      ))}
                    </Select>
                  </GridItem>
                  <GridItem w='100%'>
                    <Input
                      value={scheduleDate.day}
                      onChange={(e) => handleChange(e, 'day')}
                      border={'1px solid #E5E7EB'}
                      fontSize={'13px'}
                      fontWeight={400}
                      lineHeight={1}
                      padding={'10px 16px'}
                      h={'auto'}
                      backgroundColor={'#FFFFFF'}
                      borderRadius={8}
                      placeholder='23' />
                  </GridItem>
                  <GridItem w='100%'>
                    <Input
                      value={scheduleDate.year}
                      onChange={(e) => handleChange(e, 'year')}
                      border={'1px solid #E5E7EB'}
                      fontSize={'13px'}
                      fontWeight={400}
                      lineHeight={1}
                      padding={'10px 16px'}
                      h={'auto'}
                      backgroundColor={'#FFFFFF'}
                      borderRadius={8}
                      placeholder='2023' />
                  </GridItem>
                </Grid>
              </Flex>

              <Flex w={'100%'} pt={4} pb={3} gap={3}
                justify={'flex-end'}
                borderTop={'1px solid #F3F4F6'}>
                <Button
                  onClick={() => setOpen(false)}
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
                    setOpen(false)
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
        </Flex>
      </MenuList>
    </Menu>
  )
}