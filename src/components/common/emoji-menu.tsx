import React, {useEffect, useState} from "react";
import {Flex, Grid, GridItem, Input, InputGroup, InputLeftElement} from "@chakra-ui/react";
import {SearchIcon} from "@chakra-ui/icons";
import {emojiArrayWithName} from "@/utils/common.functions";


export function EmojiMenu(props: any) {
    const [searchValue, setSearchValue] = useState<string>('');
    const [filteredEmojis, setFilteredEmojis] = useState<any>([]);

    useEffect(() => {
        if (searchValue.length > 0) {
            setFilteredEmojis((emojiArrayWithName || []).filter((item: any) => item.name?.toLowerCase().includes(searchValue.toLowerCase())));
        } else {
            setFilteredEmojis((emojiArrayWithName || []));
        }
    }, [searchValue]);

    return (
        <>
            <Flex padding={4} borderBottom={'1px solid #F3F4F6'}>
                <InputGroup className={'emoji-search-group'}>
                    <InputLeftElement h={'100%'} width={'33px'} pointerEvents='none' color={'#6B7280'}
                                      fontSize={'13px'}>
                        <SearchIcon/>
                    </InputLeftElement>
                    <Input value={searchValue}
                           onChange={(e) => setSearchValue(e.target.value)}
                           placeholder='Search emoji'/>
                </InputGroup>
            </Flex>
            <Grid
                templateColumns='repeat(10, 1fr)' maxH={'175px'}
                overflow={'auto'} gap={2} padding={3}
            >
                {filteredEmojis.map((emoji: any, index: number) => (
                    <GridItem w='100%' key={index}>
                        <div
                            className={'emoji-modal-icon'}
                            onClick={() => {
                                if (props?.onChange) {
                                    props?.onChange(emoji.emoji)
                                }
                                if (props?.onChangeVisibility) {
                                    props?.onChangeVisibility(false)
                                }
                                setSearchValue('');
                            }}
                        >
                            {emoji.emoji}
                        </div>
                    </GridItem>
                ))}
            </Grid>
        </>
    )
}
