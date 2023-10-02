import { ToolbarUrlType } from "@/types/props-types/toolbar-url-type"
import { Box, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody, FormControl, FormLabel, Input, Button } from "@chakra-ui/react"
import Image from "next/image"
import { useState } from "react"

export default function ToolbarUrl({ isOpen, onChangeVisibility, onChange, editor }: ToolbarUrlType) {
  const [url, setUrl] = useState('')

  return (
    <Popover
        isOpen={isOpen}
        onClose={() => {
          onChangeVisibility(false)
          setUrl('')
        }}
      >
        <PopoverTrigger>
          <button
            onClick={() => {
              onChangeVisibility(!isOpen)
              setUrl(editor.getAttributes('link').href)
            }}
            className={editor.isActive('link') ? 'is-active' : ''}
          >
            <Image src="/image/icon/link.svg" alt="Link" width={16} height={16} />
          </button>
        </PopoverTrigger>
        <PopoverContent width={250}>
          <PopoverArrow />
          <PopoverBody padding={4}>
            <Box display={'flex'} flexDirection={'column'} gap={4}>
              <FormControl>
                <FormLabel fontSize={13} fontWeight={'semibold'}>URL</FormLabel>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </FormControl>
              <Box display={'flex'} gap={2}>
                <Button
                  width={'auto'}
                  backgroundColor={'#000'}
                  border={'1px solid #000'}
                  color={'#fff'}
                  fontSize={13}
                  paddingX={8} paddingY={4}
                  className='button'
                  onClick={() => onChange(url)}
                >
                  Add
                </Button>
                <Button
                  width={'auto'}
                  backgroundColor={'#fff'}
                  border={'1px solid #000'}
                  color={'#000'}
                  fontSize={13}
                  paddingX={8} paddingY={4}
                  className='button'
                  onClick={() => {
                    onChangeVisibility(false)
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Popover>
  )
}