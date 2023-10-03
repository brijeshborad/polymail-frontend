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
import { useState } from "react"
import {emojiArray} from "@/utils/common.functions";

export default function ToolbarEmoji({ isOpen, onChangeVisibility, onChange, editor }: ToolbarUrlType) {
  const [emoji, setEmoji] = useState('')

  const emojiChange = (item: string) => {
    setEmoji(item);
  }
  return (
    <Popover
      placement={'top'}
      isLazy={true}
      isOpen={isOpen}
      onClose={() => {
        onChangeVisibility(false)
        setEmoji('')
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
          <Grid templateColumns='repeat(10, 1fr)' maxH={'175px'} overflow={'auto'} gap={2}
                padding={3}>
            {emojiArray.map((item: string, index: number) => (
              <GridItem w='100%' key={index} onClick={() => emojiChange(item)}>
                <div className={'emoji-modal-icon'}  onClick={() => onChange(emoji)}> {item} </div>
              </GridItem>
            ))}
          </Grid>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
