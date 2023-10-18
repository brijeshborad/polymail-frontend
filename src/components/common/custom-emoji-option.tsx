import React, {useState} from "react";
import {EditorState, Modifier} from "draft-js";
import {Flex, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {EmojiIcon} from "@/icons";
import {EmojiMenu} from "@/components/common/emoji-menu";

export function CustomOption({onChange, editorState}: any) {
    const [isEmojiMenu, setIsEmojiMenuShow] = useState<boolean>(false);

    const addStar = (item: string) => {
        const contentState = Modifier.replaceText(
            editorState.getCurrentContent(),
            editorState.getSelection(),
            item,
            editorState.getCurrentInlineStyle(),
        );
        onChange(EditorState.push(editorState, contentState, 'insert-characters'));
        setIsEmojiMenuShow(false);
    };

    return (
        <>
            <Flex align={'center'} gap={2} className={styles.emojiIcon}>
                <Flex onClick={() => {
                    setIsEmojiMenuShow(!isEmojiMenu)
                }}>
                    <EmojiIcon/>
                </Flex>
            </Flex>
            {/*{isEmojiMenu && <EmojiMenu onChange={addStar}/>}*/}
            {isEmojiMenu && <Popover
                placement={'top'}
                isLazy={true}
                isOpen={isEmojiMenu}
                onClose={() => {
                    setIsEmojiMenuShow(false)
                }}
            >
                <PopoverTrigger>
                    <button
                        onClick={() => {
                            setIsEmojiMenuShow(!isEmojiMenu)
                        }}
                    >
                        {/*<Image priority src="/image/icon/emoji.svg" alt="emoji" width={16} height={16}/>*/}
                    </button>
                </PopoverTrigger>
                <PopoverContent width={250} className={'emoji-popover signature-emoji-popover'}>
                    <PopoverArrow/>
                    <PopoverBody padding={0}>
                        <EmojiMenu onChange={addStar} onChangeVisibility={setIsEmojiMenuShow}/>
                    </PopoverBody>
                </PopoverContent>
            </Popover>}
        </>
    );
}
