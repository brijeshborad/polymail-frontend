import { ToolbarUrlType } from "@/types/props-types/toolbar-url-type"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  GridItem, Grid
} from "@chakra-ui/react"
import Image from "next/image"
import {emojiArray} from "@/utils/common.functions";

export default function ToolbarEmoji({ isOpen, onChangeVisibility, onChange, editor }: ToolbarUrlType) {
  return (
    <Popover
      placement={'top'}
      isLazy={true}
      isOpen={isOpen}
      onClose={() => {
        onChangeVisibility(false)
      }}
    >
      <PopoverTrigger>
        <button
          onClick={() => {
            onChangeVisibility(!isOpen)
          }}
          className={editor.isActive('emoji') ? 'is-active' : ''}
        >
          <Image src="/image/icon/emoji.svg" alt="emoji" width={16} height={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent width={250} className={'emoji-popover'}>
        <PopoverArrow />
        <PopoverBody padding={0}>
          <Grid 
            templateColumns='repeat(10, 1fr)' maxH={'175px'} 
            overflow={'auto'} gap={2} padding={3}
          >
            {emojiArray.map((emoji: string, index: number) => (
              <GridItem w='100%' key={index}>
                <div 
                  className={'emoji-modal-icon'}  
                  onClick={() => {
                    onChange(emoji)
                    onChangeVisibility(false)
                  }}
                >
                  {emoji} 
                </div>
              </GridItem>
            ))}
          </Grid>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
