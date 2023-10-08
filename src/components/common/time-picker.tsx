import {ClockIcon} from "@/icons"
import {TimePickerProps} from "@/types/props-types/time-picker.props.type"
import {Button, Flex, Menu, MenuButton, MenuItem, MenuList, Text} from "@chakra-ui/react"
import {useState} from "react"

export default function TimePicker({scheduledDate, onChange}: TimePickerProps) {
    const [date, setDate] = useState(scheduledDate)
    const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(hour => String(hour).padStart(2, '0'))
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(min => String(min).padStart(2, '0'))

    const handleChange = (value: string, type: 'hour' | 'minute') => {
        setDate({
            ...date,
            time: {
                ...date.time,
                [type]: value
            }
        })
    }

    const handleClose = () => {
        onChange(date)
    }

    return (
        <Menu closeOnSelect={false} onClose={handleClose}>
            <MenuButton
                fontSize={'12px'}
                color={'#374151'} w={'full'}
                backgroundColor={'#FFFFFF'} h={'auto'} p={'11px 4px 10px 4px'}
                border={'1px solid #E5E7EB'} borderRadius={'8px'}
                as={Button}
                rightIcon={<ClockIcon/>}
            >
                {date.time.hour}:{date.time.minute}
            </MenuButton>
            <MenuList className={`drop-down-list`} zIndex={'overlay'}>
                <Flex direction={'row'} maxHeight={200} overflow={'hidden'}>
                    <Flex direction={'column'} width={'50%'}>
                        <Text paddingTop={2} paddingBottom={0} paddingLeft={2} fontSize={12}
                              fontWeight={600}>Hour(s)</Text>
                        <Flex direction={'column'} maxHeight={200} overflow={'scroll'}>
                            {hours.map(hour => (
                                    <MenuItem
                                        key={hour}
                                        onClick={() => handleChange(hour, 'hour')}
                                        backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                                        justifyContent={'flex-start'}
                                    >
                                        {hour}
                                    </MenuItem>
                                )
                            )}
                        </Flex>
                    </Flex>
                    <Flex direction={'column'} width={'50%'} maxHeight={200} overflow={'scroll'}>
                        <Text paddingTop={2} paddingBottom={0} paddingLeft={2} fontSize={12}
                              fontWeight={600}>Minute(s)</Text>
                        <Flex direction={'column'} maxHeight={200} overflow={'scroll'}>
                            {minutes.map(min => (
                                <MenuItem
                                    key={min}
                                    onClick={() => handleChange(min, 'minute')}
                                    backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                                    justifyContent={'flex-start'}
                                >
                                    {min}
                                </MenuItem>
                            ))}
                        </Flex>
                    </Flex>
                </Flex>
            </MenuList>
        </Menu>
    )
}
