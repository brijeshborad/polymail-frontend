import {ToolbarUrlType} from "@/types/props-types/toolbar-url-type"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverBody,
} from "@chakra-ui/react"
import Image from "next/image"
import React from "react";
import {EmojiMenu} from "@/components/common";

export default function ToolbarEmoji({isOpen, onChangeVisibility, onChange, editor}: ToolbarUrlType) {
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
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChangeVisibility(!isOpen)
                    }}
                    className={editor.isActive('emoji') ? 'is-active' : ''}
                >
                    <Image priority src="/image/icon/emoji.svg" alt="emoji" width={16} height={16}/>
                </button>
            </PopoverTrigger>
            <PopoverContent width={250} className={'emoji-popover'}>
                <PopoverArrow/>
                <PopoverBody padding={0}>
                    {/*<Grid*/}
                    {/*    templateColumns='repeat(10, 1fr)' maxH={'175px'}*/}
                    {/*    overflow={'auto'} gap={2} padding={3}*/}
                    {/*>*/}
                    {/*    {emojiArray.map((emoji: string, index: number) => (*/}
                    {/*        <GridItem w='100%' key={index}>*/}
                    {/*            <div*/}
                    {/*                className={'emoji-modal-icon'}*/}
                    {/*                onClick={() => {*/}
                    {/*                    onChange(emoji)*/}
                    {/*                    onChangeVisibility(false)*/}
                    {/*                }}*/}
                    {/*            >*/}
                    {/*                {emoji}*/}
                    {/*            </div>*/}
                    {/*        </GridItem>*/}
                    {/*    ))}*/}
                    {/*</Grid>*/}
                    <EmojiMenu onChange={onChange} onChangeVisibility={onChangeVisibility}/>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}
